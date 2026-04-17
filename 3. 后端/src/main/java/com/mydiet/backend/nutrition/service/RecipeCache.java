package com.mydiet.backend.nutrition.service;

import com.mydiet.backend.nutrition.entity.Recipe;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

/**
 * 启动时将全部食谱加载到内存，提供 Java 端过滤 + 随机采样。
 * 一次性解决三个性能瓶颈：
 *   1. ORDER BY RAND() 全表排序   → Collections.shuffle O(n)
 *   2. LIKE '%allergen%' 全表扫描 → String.contains 内存匹配
 *   3. 每次请求都查 DB            → 启动加载一次，后续零 DB 查询
 */
@Service
public class RecipeCache {

    private static final Logger log = LoggerFactory.getLogger(RecipeCache.class);

    @PersistenceContext
    private EntityManager em;

    @Autowired
    private PlatformTransactionManager txManager;

    /** id → 完整 Recipe（启动后只读） */
    private Map<Integer, Recipe> byId;

    /** 轻量元数据列表，用于快速过滤 */
    private List<Meta> metas;

    /* ── 早餐分类 ── */
    private static final Set<String> BREAKFAST_CATS = Set.of(
        "Breakfast", "Smoothies", "Quick Breads", "Breads"
    );

    /* ── 午/晚排除分类 ── */
    private static final Set<String> EXCLUDE_CATS = Set.of(
        "Dessert", "Candy", "Beverages", "Bar Cookie", "Drop Cookies",
        "Spreads", "Salad Dressings", "Sauces"
    );

    // ─── 启动加载 ──────────────────────────────────────────

    @PostConstruct
    void init() {
        TransactionTemplate tx = new TransactionTemplate(txManager);
        tx.setReadOnly(true);
        tx.executeWithoutResult(status -> load());
    }

    @SuppressWarnings("unchecked")
    private void load() {
        long t0 = System.currentTimeMillis();
        List<Recipe> all = em.createNativeQuery(
            "SELECT * FROM mydiet_nutrition.recipes", Recipe.class
        ).getResultList();

        byId  = new HashMap<>(all.size());
        metas = new ArrayList<>(all.size());

        for (Recipe r : all) {
            //em.detach(r);
            byId.put(r.getId(), r);
            metas.add(new Meta(
                r.getId(),
                r.getCalories()  != null ? r.getCalories()  : 0,
                r.getCategory()  != null ? r.getCategory()  : "",
                lower(r.getIngredients()),
                lower(r.getKeywords())
            ));
        }

        long elapsed = System.currentTimeMillis() - t0;
        log.info("RecipeCache loaded {} recipes in {} ms", metas.size(), elapsed);
    }

    // ─── 对外方法：过滤 + 随机采样 ─────────────────────────

    /**
     * 在内存中完成 category/热量/过敏原/排除 ID 过滤，
     * 然后 Fisher-Yates 洗牌取前 limit 条，返回完整 Recipe 对象。
     */
    public List<Recipe> getCandidates(double minCal, double maxCal,
                                       List<String> allergies,
                                       Set<Integer> excludeIds,
                                       String mealType, int limit) {

        List<String> aLower = (allergies != null)
            ? allergies.stream()
                .map(a -> a.trim().toLowerCase())
                .collect(Collectors.toList())
            : List.of();

        // ── Java 端过滤（替代 SQL WHERE + LIKE）──
        List<Meta> pool = new ArrayList<>();
        for (Meta m : metas) {
            if (m.cal < minCal || m.cal > maxCal)                continue;
            if (excludeIds != null && excludeIds.contains(m.id)) continue;
            if (!mealTypeOk(m, mealType))                        continue;
            if (hasAllergen(m, aLower))                           continue;
            pool.add(m);
        }

        // ── Fisher-Yates 洗牌 O(n)，替代 ORDER BY RAND() O(n·log n) ──
        Collections.shuffle(pool, ThreadLocalRandom.current());

        // ── 取前 limit 条，映射回完整 Recipe 对象 ──
        return pool.stream()
            .limit(limit)
            .map(m -> byId.get(m.id))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }

    public Recipe getById(int id) {
        return byId.get(id);
    }

    // ─── 内部工具 ─────────────────────────────────────────

    private boolean mealTypeOk(Meta m, String mealType) {
        if ("breakfast".equalsIgnoreCase(mealType)) {
            return BREAKFAST_CATS.contains(m.cat);
        }
        return !EXCLUDE_CATS.contains(m.cat) && !BREAKFAST_CATS.contains(m.cat);
    }

    private boolean hasAllergen(Meta m, List<String> aLower) {
        for (String a : aLower) {
            if (m.ingLow.contains(a) || m.kwLow.contains(a)) return true;
        }
        return false;
    }

    private static String lower(String s) {
        return s != null ? s.toLowerCase() : "";
    }

    /** 轻量元数据：id + 热量 + 分类 + 小写食材/关键词（仅用于过滤） */
    record Meta(int id, double cal, String cat, String ingLow, String kwLow) {}
}
