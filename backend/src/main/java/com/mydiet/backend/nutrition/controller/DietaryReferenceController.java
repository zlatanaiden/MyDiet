package com.mydiet.backend.nutrition.controller;

import com.mydiet.backend.nutrition.entity.DietaryReference;
import com.mydiet.backend.nutrition.repository.DietaryReferenceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 每日营养参考摄入量 API
 *
 * GET /api/dietary-references              全部记录
 * GET /api/dietary-references/lookup?age=25&gender=Male   按年龄+性别查询
 */
@RestController
@RequestMapping("/api/dietary-references")
@CrossOrigin(origins = "*")
public class DietaryReferenceController {

    private final DietaryReferenceRepository repo;

    public DietaryReferenceController(DietaryReferenceRepository repo) {
        this.repo = repo;
    }

    /** 返回全部 DRI 数据（仅 20 条，直接全量返回） */
    @GetMapping
    public List<DietaryReference> getAll() {
        return repo.findAll();
    }

    /**
     * 按年龄和性别查询最匹配的 DRI 行
     * 例：GET /api/dietary-references/lookup?age=25&gender=Male
     */
    @GetMapping("/lookup")
    public ResponseEntity<DietaryReference> lookup(
            @RequestParam double age,
            @RequestParam(defaultValue = "Both") String gender) {
        return repo.findByAgeAndGender(age, gender)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
