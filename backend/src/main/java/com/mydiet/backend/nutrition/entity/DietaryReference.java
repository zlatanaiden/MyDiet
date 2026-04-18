package com.mydiet.backend.nutrition.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "dietary_references", catalog = "mydiet_nutrition")
public class DietaryReference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String category;
    private String gender;

    @Column(name = "min_age")
    private Double minAge;

    @Column(name = "max_age")
    private Double maxAge;

    @Column(name = "age_unit")
    private String ageUnit;

    @Column(name = "protein_g")
    private Double proteinG;

    @Column(name = "carbohydrate_g")
    private Double carbohydrateG;

    @Column(name = "fiber_g")
    private Double fiberG;

    @Column(name = "water_l")
    private Double waterL;

    @Column(name = "vit_a_ug")  private Double vitAUg;
    @Column(name = "vit_c_mg")  private Double vitCMg;
    @Column(name = "vit_d_ug")  private Double vitDUg;
    @Column(name = "vit_e_mg")  private Double vitEMg;
    @Column(name = "vit_k_ug")  private Double vitKUg;
    @Column(name = "thiamin_mg")     private Double thiaminMg;
    @Column(name = "riboflavin_mg")  private Double riboflavinMg;
    @Column(name = "vit_b6_mg")      private Double vitB6Mg;
    @Column(name = "vit_b12_ug")     private Double vitB12Ug;
    @Column(name = "calcium_mg")     private Double calciumMg;
    @Column(name = "iron_mg")        private Double ironMg;
    @Column(name = "magnesium_mg")   private Double magnesiumMg;
    @Column(name = "phosphorus_mg")  private Double phosphorusMg;
    @Column(name = "zinc_mg")        private Double zincMg;
    @Column(name = "sodium_mg")      private Double sodiumMg;
    @Column(name = "potassium_mg")   private Double potassiumMg;
    @Column(name = "target_calories") private Double targetCalories;

    // ── Getters ──────────────────────────────────────────────

    public Integer getId() { return id; }
    public String getCategory() { return category; }
    public String getGender() { return gender; }
    public Double getMinAge() { return minAge; }
    public Double getMaxAge() { return maxAge; }
    public String getAgeUnit() { return ageUnit; }
    public Double getProteinG() { return proteinG; }
    public Double getCarbohydrateG() { return carbohydrateG; }
    public Double getFiberG() { return fiberG; }
    public Double getWaterL() { return waterL; }
    public Double getVitAUg() { return vitAUg; }
    public Double getVitCMg() { return vitCMg; }
    public Double getVitDUg() { return vitDUg; }
    public Double getVitEMg() { return vitEMg; }
    public Double getVitKUg() { return vitKUg; }
    public Double getThiaminMg() { return thiaminMg; }
    public Double getRiboflavinMg() { return riboflavinMg; }
    public Double getVitB6Mg() { return vitB6Mg; }
    public Double getVitB12Ug() { return vitB12Ug; }
    public Double getCalciumMg() { return calciumMg; }
    public Double getIronMg() { return ironMg; }
    public Double getMagnesiumMg() { return magnesiumMg; }
    public Double getPhosphorusMg() { return phosphorusMg; }
    public Double getZincMg() { return zincMg; }
    public Double getSodiumMg() { return sodiumMg; }
    public Double getPotassiumMg() { return potassiumMg; }
    public Double getTargetCalories() { return targetCalories; }
}
