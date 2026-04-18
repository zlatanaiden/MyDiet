package com.mydiet.backend.nutrition.service;

import com.mydiet.backend.nutrition.dto.*;
import com.mydiet.backend.nutrition.dto.MealPlanResponse.*;
import com.mydiet.backend.nutrition.entity.Recipe;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.web.util.HtmlUtils;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class MealPlanService {

    @Autowired
    private RecipeCache recipeCache;

    // ── 热量分配比例 3:4:3 ──
    private static final double BREAKFAST_RATIO = 0.3;
    private static final double LUNCH_RATIO     = 0.4;
    private static final double DINNER_RATIO    = 0.3;

    // ── 初始容差 ±15%，不够再放宽到 ±25% ──
    private static final double TOLERANCE       = 0.15;
    private static final double TOLERANCE_WIDE  = 0.25;

    // ── 每餐从 DB 抽多少候选 ──
    private static final int CANDIDATE_POOL = 50;
    // ── 备选数（和前端 alternatives 数量一致）──
    private static final int ALT_COUNT = 3;

    // ── PAL 活动系数（5档）──
    private static final Map<String, Double> PAL = Map.of(
        "sedentary",    1.2,
        "light",        1.375,
        "moderate",     1.55,
        "active",       1.725,
        "veryActive",   1.9
    );

    // ── AMDR 宏量营养素比例（取中值）──
    // Protein 20%, Carbs 50%, Fat 30%
    private static final double PROTEIN_RATIO = 0.20;
    private static final double CARB_RATIO    = 0.50;
    private static final double FAT_RATIO     = 0.30;

    // ====================================================================
    //  公共方法：生成 7 天计划
    // ====================================================================
    public MealPlanResponse generateWeeklyPlan(MealPlanRequest req) {
        double bmr  = calcBmr(req);
        double tdee = calcTdee(bmr, req.getActivityLevel());

        // ── 根据目标调整热量 ──
        String goal = req.getGoal() != null ? req.getGoal() : "maintain";
        double adjustedTdee;
        switch (goal) {
            case "lose":
                adjustedTdee = tdee - 500;   // 减重：每日减 500 kcal
                break;
            case "gain":
                adjustedTdee = tdee + 300;   // 增重：每日加 300 kcal
                break;
            default:
                adjustedTdee = tdee;         // 维持
                break;
        }

        double bfCal = adjustedTdee * BREAKFAST_RATIO;
        double lnCal = adjustedTdee * LUNCH_RATIO;
        double dnCal = adjustedTdee * DINNER_RATIO;

        Set<Integer> usedIds = new HashSet<>();
        List<DayPlanDTO> days = new ArrayList<>();
        String[] dayNames = {"Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"};

        for (String dayName : dayNames) {
            MealSlot bf = pickMealSlot(bfCal, req.getAllergies(), usedIds, "breakfast");
            MealSlot ln = pickMealSlot(lnCal, req.getAllergies(), usedIds, "lunch");
            MealSlot dn = pickMealSlot(dnCal, req.getAllergies(), usedIds, "dinner");

            // 记录已选 ID（7 天不重复）
            recordIds(usedIds, bf);
            recordIds(usedIds, ln);
            recordIds(usedIds, dn);

            days.add(buildDay(dayName, bf, ln, dn));
        }

        // 每日宏量目标（基于调整后的热量）
        DailyTargetsDTO tgt = new DailyTargetsDTO();
        tgt.setCalories(Math.round(adjustedTdee));
        tgt.setProtein(Math.round(adjustedTdee * PROTEIN_RATIO / 4.0));
        tgt.setCarbs(Math.round(adjustedTdee * CARB_RATIO / 4.0));
        tgt.setFats(Math.round(adjustedTdee * FAT_RATIO / 9.0));
        tgt.setFiber(req.getGender().equalsIgnoreCase("Male") ? 38 : 25);

        MealPlanResponse resp = new MealPlanResponse();
        resp.setBmr(Math.round(bmr));
        resp.setTdee(Math.round(adjustedTdee));
        resp.setTargets(tgt);
        resp.setWeeklyPlan(days);
        return resp;
    }

    // ====================================================================
    //  公共方法：换餐（替换一个 meal slot，返回新 main + 3 alternatives）
    // ====================================================================
    public SwapResponse swapMeal(SwapRequest req) {
        Set<Integer> excluded = new HashSet<>(
            req.getExcludeIds() != null ? req.getExcludeIds() : List.of()
        );
        MealSlot slot = pickMealSlot(
            req.getTargetCalories(), req.getAllergies(), excluded, req.getMealType()
        );

        SwapResponse resp = new SwapResponse();
        resp.setMain(toDto(slot.main));
        resp.setAlternatives(slot.alts.stream().map(this::toDto).collect(Collectors.toList()));
        return resp;
    }

    // ====================================================================
    //  核心：为一个 meal slot 选出 1 main + 3 alternatives
    // ====================================================================
    private MealSlot pickMealSlot(double targetCal, List<String> allergies,
                                  Set<Integer> usedIds, String mealType) {

        double protTgt = targetCal * PROTEIN_RATIO / 4.0;
        double carbTgt = targetCal * CARB_RATIO   / 4.0;
        double fatTgt  = targetCal * FAT_RATIO    / 9.0;

        // 第一轮：±15%
        List<Recipe> pool = queryCandidates(
            targetCal * (1 - TOLERANCE), targetCal * (1 + TOLERANCE),
            allergies, usedIds, mealType, CANDIDATE_POOL
        );

        // 不够 4 条 → 放宽到 ±25%
        if (pool.size() < 4) {
            pool = queryCandidates(
                targetCal * (1 - TOLERANCE_WIDE), targetCal * (1 + TOLERANCE_WIDE),
                allergies, usedIds, mealType, CANDIDATE_POOL
            );
        }

        // 按 least-squares 评分排序
        pool.sort(Comparator.comparingDouble(r ->
            score(r, targetCal, protTgt, carbTgt, fatTgt)
        ));

        MealSlot slot = new MealSlot();
        slot.main = pool.isEmpty() ? null : pool.get(0);
        slot.alts = pool.stream().skip(1).limit(ALT_COUNT).collect(Collectors.toList());
        return slot;
    }

    // ====================================================================
    //  候选查询：委托 RecipeCache 在内存中完成过滤 + 随机采样
    // ====================================================================
    private List<Recipe> queryCandidates(double minCal, double maxCal,
                                         List<String> allergies,
                                         Set<Integer> usedIds,
                                         String mealType, int limit) {
        return recipeCache.getCandidates(minCal, maxCal, allergies, usedIds, mealType, limit);
    }

    // ====================================================================
    //  least-squares 评分（卡路里权重 ×2）
    // ====================================================================
    private double score(Recipe r, double calTgt, double protTgt, double carbTgt, double fatTgt) {
        double cD = norm(r.getCalories(),      calTgt);
        double pD = norm(r.getProteinG(),      protTgt);
        double kD = norm(r.getCarbohydrateG(), carbTgt);
        double fD = norm(r.getFatG(),          fatTgt);
        return 2.0 * cD * cD + pD * pD + kD * kD + fD * fD;
    }

    private double norm(Float actual, double target) {
        if (actual == null || target == 0) return 0;
        return (actual - target) / target;
    }

    // ====================================================================
    //  BMR / TDEE（复用前端相同公式）
    // ====================================================================
    private double calcBmr(MealPlanRequest req) {
        int age        = req.getAge();
        double weight  = req.getWeightKg();
        double height  = req.getHeightCm();
        boolean isMale = "Male".equalsIgnoreCase(req.getGender());

        if (age < 2) {
            // 婴幼儿 FAO: BMR ≈ 89 × 体重 - 100
            return 89 * weight - 100;
        }
        if (age < 10) {
            return isMale ? 22.7 * weight + 495 : 22.5 * weight + 499;
        }
        if (age < 19) {
            return isMale ? 17.5 * weight + 651 : 12.2 * weight + 746;
        }
        // 成人 Mifflin-St Jeor
        double base = 10 * weight + 6.25 * height - 5 * age;
        return isMale ? base + 5 : base - 161;
    }

    private double calcTdee(double bmr, String activityLevel) {
        double pal = (activityLevel != null) ? PAL.getOrDefault(activityLevel, 1.55) : 1.55;
        return bmr * pal;
    }

    // ====================================================================
    //  辅助
    // ====================================================================
    private RecipeDTO toDto(Recipe r) {
        if (r == null) return null;
        return new RecipeDTO(
            r.getId(), HtmlUtils.htmlUnescape(r.getName()), r.getCalories(), r.getProteinG(),
            r.getCarbohydrateG(), r.getFatG(), extractFirstUrl(r.getImageUrl()), r.getCategory(),
            r.getTotalTime(), r.getKeywords(), r.getIngredients(), r.getQuantities(), r.getInstructions()
        );
    }

    private static final Pattern URL_PATTERN = Pattern.compile("\"(https?://[^\"]+)\"");

    private String extractFirstUrl(String raw) {
        if (raw == null || raw.isBlank()) return null;
        if (raw.startsWith("http")) return raw.trim();
        Matcher m = URL_PATTERN.matcher(raw);
        return m.find() ? m.group(1) : null;
    }

    private void recordIds(Set<Integer> usedIds, MealSlot slot) {
        if (slot.main != null) usedIds.add(slot.main.getId());
        slot.alts.forEach(a -> usedIds.add(a.getId()));
    }

    private DayPlanDTO buildDay(String dayName, MealSlot bf, MealSlot ln, MealSlot dn) {
        MealsDTO meals = new MealsDTO();
        meals.setBreakfast(toDto(bf.main));
        meals.setLunch(toDto(ln.main));
        meals.setDinner(toDto(dn.main));

        AlternativesDTO alts = new AlternativesDTO();
        alts.setBreakfast(bf.alts.stream().map(this::toDto).collect(Collectors.toList()));
        alts.setLunch(ln.alts.stream().map(this::toDto).collect(Collectors.toList()));
        alts.setDinner(dn.alts.stream().map(this::toDto).collect(Collectors.toList()));

        DayPlanDTO day = new DayPlanDTO();
        day.setDay(dayName);
        day.setMeals(meals);
        day.setAlternatives(alts);
        return day;
    }

    private static class MealSlot {
        Recipe main;
        List<Recipe> alts = new ArrayList<>();
    }
}
