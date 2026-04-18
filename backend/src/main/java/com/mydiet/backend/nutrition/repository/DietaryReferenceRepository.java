package com.mydiet.backend.nutrition.repository;

import com.mydiet.backend.nutrition.entity.DietaryReference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface DietaryReferenceRepository extends JpaRepository<DietaryReference, Integer> {

    /**
     * 根据年龄和性别找最匹配的 DRI 行。
     * gender 传 "Male"/"Female"/"Both"，age 传浮点年龄。
     */
    @Query(value = """
        SELECT * FROM dietary_references
        WHERE min_age <= :age AND max_age > :age
          AND (gender = :gender OR gender = 'Both')
        ORDER BY
          CASE WHEN gender = :gender THEN 0 ELSE 1 END
        LIMIT 1
        """, nativeQuery = true)
    Optional<DietaryReference> findByAgeAndGender(
        @Param("age") double age,
        @Param("gender") String gender
    );
}
