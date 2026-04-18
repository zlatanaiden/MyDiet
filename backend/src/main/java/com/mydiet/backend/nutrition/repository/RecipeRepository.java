package com.mydiet.backend.nutrition.repository;

import com.mydiet.backend.nutrition.entity.Recipe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RecipeRepository extends JpaRepository<Recipe, Integer> {

    /**
     * 按热量范围随机抽取食谱，支持过敏源排除。
     * excludeKeyword 传 NULL 时不过滤关键词。
     */
    @Query(value = """
        SELECT * FROM recipes
        WHERE calories BETWEEN :minCal AND :maxCal
          AND (:excludeKeyword IS NULL
               OR ingredients NOT LIKE CONCAT('%', :excludeKeyword, '%'))
        ORDER BY RAND()
        LIMIT 3
        """, nativeQuery = true)
    java.util.List<Recipe> findByCaloriesRangeRandom(
        @Param("minCal") double minCal,
        @Param("maxCal") double maxCal,
        @Param("excludeKeyword") String excludeKeyword
    );

    /** 按分类分页查询 */
    Page<Recipe> findByCategoryIgnoreCase(String category, Pageable pageable);

    /** 按名称模糊搜索（分页） */
    Page<Recipe> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
