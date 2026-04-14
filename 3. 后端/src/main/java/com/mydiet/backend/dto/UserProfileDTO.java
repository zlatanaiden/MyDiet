package com.mydiet.backend.dto;

import java.util.List;

public class UserProfileDTO {
    private Integer age;
    private String gender;
    private Double heightCm;
    private Double weightKg;
    private Double targetWeight;
    private String goal;
    private String activityLevel;
    private List<String> allergies;
    private List<String> restrictions;

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public Double getHeightCm() { return heightCm; }
    public void setHeightCm(Double heightCm) { this.heightCm = heightCm; }

    public Double getWeightKg() { return weightKg; }
    public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }

    public Double getTargetWeight() { return targetWeight; }
    public void setTargetWeight(Double targetWeight) { this.targetWeight = targetWeight; }

    public String getGoal() { return goal; }
    public void setGoal(String goal) { this.goal = goal; }

    public String getActivityLevel() { return activityLevel; }
    public void setActivityLevel(String activityLevel) { this.activityLevel = activityLevel; }

    public List<String> getAllergies() { return allergies; }
    public void setAllergies(List<String> allergies) { this.allergies = allergies; }

    public List<String> getRestrictions() { return restrictions; }
    public void setRestrictions(List<String> restrictions) { this.restrictions = restrictions; }
}
