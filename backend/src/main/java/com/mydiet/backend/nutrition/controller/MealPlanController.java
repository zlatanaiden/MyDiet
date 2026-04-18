package com.mydiet.backend.nutrition.controller;

import com.mydiet.backend.nutrition.dto.*;
import com.mydiet.backend.nutrition.service.MealPlanService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/meal-plan")
@CrossOrigin(origins = "*")
public class MealPlanController {

    private final MealPlanService service;

    public MealPlanController(MealPlanService service) {
        this.service = service;
    }

    /**
     * 生成 7 天饮食计划
     * POST /api/meal-plan/generate
     */
    @PostMapping("/generate")
    public ResponseEntity<MealPlanResponse> generate(@RequestBody MealPlanRequest req) {
        MealPlanResponse plan = service.generateWeeklyPlan(req);
        return ResponseEntity.ok(plan);
    }

    /**
     * 换餐：替换某一餐，返回新 main + 3 alternatives
     * POST /api/meal-plan/swap
     */
    @PostMapping("/swap")
    public ResponseEntity<SwapResponse> swap(@RequestBody SwapRequest req) {
        SwapResponse result = service.swapMeal(req);
        return ResponseEntity.ok(result);
    }
}
