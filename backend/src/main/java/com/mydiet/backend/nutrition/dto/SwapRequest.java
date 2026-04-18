package com.mydiet.backend.nutrition.dto;

import java.util.List;

public class SwapRequest {
    private double targetCalories;
    private double tdee;
    private String mealType;        // "breakfast" | "lunch" | "dinner"
    private List<String> allergies;
    private List<Integer> excludeIds; // all recipe IDs already in the plan

    public double getTargetCalories() { return targetCalories; }
    public void setTargetCalories(double targetCalories) { this.targetCalories = targetCalories; }

    public double getTdee() { return tdee; }
    public void setTdee(double tdee) { this.tdee = tdee; }

    public String getMealType() { return mealType; }
    public void setMealType(String mealType) { this.mealType = mealType; }

    public List<String> getAllergies() { return allergies; }
    public void setAllergies(List<String> allergies) { this.allergies = allergies; }

    public List<Integer> getExcludeIds() { return excludeIds; }
    public void setExcludeIds(List<Integer> excludeIds) { this.excludeIds = excludeIds; }
}
