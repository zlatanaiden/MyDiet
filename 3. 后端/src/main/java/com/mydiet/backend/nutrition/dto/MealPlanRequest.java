package com.mydiet.backend.nutrition.dto;

import java.util.List;

public class MealPlanRequest {
    private int age;
    private String gender;          // "Male" or "Female"
    private double weightKg;
    private double heightCm;
    private String activityLevel;   // "sedentary" | "light" | "moderate" | "active" | "veryActive"
    private String goal;             // "lose" | "gain" | "maintain" (default: maintain)
    private List<String> allergies; // e.g. ["peanut", "shrimp"]

    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public double getWeightKg() { return weightKg; }
    public void setWeightKg(double weightKg) { this.weightKg = weightKg; }

    public double getHeightCm() { return heightCm; }
    public void setHeightCm(double heightCm) { this.heightCm = heightCm; }

    public String getActivityLevel() { return activityLevel; }
    public void setActivityLevel(String activityLevel) { this.activityLevel = activityLevel; }

    public String getGoal() { return goal; }
    public void setGoal(String goal) { this.goal = goal; }

    public List<String> getAllergies() { return allergies; }
    public void setAllergies(List<String> allergies) { this.allergies = allergies; }
}
