package com.mydiet.backend.nutrition.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "recipes", catalog = "mydiet_nutrition")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Recipe {

    @Id
    private Integer id;

    @Column(columnDefinition = "TEXT")
    private String name;

    @Column(name = "total_time", columnDefinition = "TEXT")
    private String totalTime;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String category;

    @Column(columnDefinition = "JSON")
    private String keywords;

    @Column(columnDefinition = "JSON")
    private String ingredients;

    @Column(columnDefinition = "JSON")
    private String quantities;

    @Column(columnDefinition = "JSON")
    private String instructions;

    private Float calories;

    @Column(name = "fat_g")
    private Float fatG;

    @Column(name = "saturated_fat_g")
    private Float saturatedFatG;

    @Column(name = "cholesterol_mg")
    private Float cholesterolMg;

    @Column(name = "sodium_mg")
    private Float sodiumMg;

    @Column(name = "carbohydrate_g")
    private Float carbohydrateG;

    @Column(name = "fiber_g")
    private Float fiberG;

    @Column(name = "sugar_g")
    private Float sugarG;

    @Column(name = "protein_g")
    private Float proteinG;

    private Integer servings;

    @Column(name = "recipe_yield", columnDefinition = "TEXT")
    private String recipeYield;
}