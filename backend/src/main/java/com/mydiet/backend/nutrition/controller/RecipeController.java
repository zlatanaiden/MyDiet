package com.mydiet.backend.nutrition.controller;

import com.mydiet.backend.nutrition.entity.Recipe;
import com.mydiet.backend.nutrition.repository.RecipeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 食谱 API
 *
 * GET /api/recipes?page=0&size=20              分页获取全部
 * GET /api/recipes/search?name=chicken         按名称搜索
 * GET /api/recipes/category?cat=Chicken Breast 按分类
 * GET /api/recipes/{id}                        单条详情
 * POST /api/recipes/suggest                    算法推荐接口（供前端 suggestDayPlan 调用）
 */
@RestController
@RequestMapping("/api/recipes")
@CrossOrigin(origins = "*")
public class RecipeController {

    private final RecipeRepository repo;

    public RecipeController(RecipeRepository repo) {
        this.repo = repo;
    }

    /** 分页获取全部食谱 */
    @GetMapping
    public Page<Recipe> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return repo.findAll(PageRequest.of(page, size));
    }

    /** 单条详情 */
    @GetMapping("/{id}")
    public ResponseEntity<Recipe> getById(@PathVariable Integer id) {
        return repo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** 按名称模糊搜索 */
    @GetMapping("/search")
    public Page<Recipe> search(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return repo.findByNameContainingIgnoreCase(name, PageRequest.of(page, size));
    }

    /** 按分类查询 */
    @GetMapping("/category")
    public Page<Recipe> byCategory(
            @RequestParam String cat,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return repo.findByCategoryIgnoreCase(cat, PageRequest.of(page, size));
    }

    /**
     * 算法推荐接口
     * 请求体示例：
     * {
     *   "minCal": 200,
     *   "maxCal": 600,
     *   "excludeKeyword": "peanut",   // 过敏源关键词，可为 null
     *   "count": 10                   // 返回条数
     * }
     */
@PostMapping("/suggest")
    public List<Recipe> suggest(@RequestBody Map<String, Object> body) {
        double minCal = toDouble(body.get("minCal"), 0);
        double maxCal = toDouble(body.get("maxCal"), 9999);
        String exclude = body.get("excludeKeyword") != null
                ? body.get("excludeKeyword").toString()
                : null;
        return repo.findByCaloriesRangeRandom(minCal, maxCal, exclude); 
    }

    private double toDouble(Object o, double fallback) {
        if (o == null) return fallback;
        try { return Double.parseDouble(o.toString()); }
        catch (NumberFormatException e) { return fallback; }
    }
}
