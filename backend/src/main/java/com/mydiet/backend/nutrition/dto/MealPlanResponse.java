package com.mydiet.backend.nutrition.dto;

import java.util.List;

public class MealPlanResponse {
    private double tdee;
    private double bmr;
    private DailyTargetsDTO targets;
    private List<DayPlanDTO> weeklyPlan;

    // ── getters / setters ──

    public double getTdee() { return tdee; }
    public void setTdee(double tdee) { this.tdee = tdee; }

    public double getBmr() { return bmr; }
    public void setBmr(double bmr) { this.bmr = bmr; }

    public DailyTargetsDTO getTargets() { return targets; }
    public void setTargets(DailyTargetsDTO targets) { this.targets = targets; }

    public List<DayPlanDTO> getWeeklyPlan() { return weeklyPlan; }
    public void setWeeklyPlan(List<DayPlanDTO> weeklyPlan) { this.weeklyPlan = weeklyPlan; }

    // ── nested DTOs ──

    public static class DailyTargetsDTO {
        private double calories;
        private double protein;
        private double carbs;
        private double fats;
        private double fiber;

        public double getCalories() { return calories; }
        public void setCalories(double calories) { this.calories = calories; }
        public double getProtein() { return protein; }
        public void setProtein(double protein) { this.protein = protein; }
        public double getCarbs() { return carbs; }
        public void setCarbs(double carbs) { this.carbs = carbs; }
        public double getFats() { return fats; }
        public void setFats(double fats) { this.fats = fats; }
        public double getFiber() { return fiber; }
        public void setFiber(double fiber) { this.fiber = fiber; }
    }

    public static class DayPlanDTO {
        private String day;
        private MealsDTO meals;
        private AlternativesDTO alternatives;

        public String getDay() { return day; }
        public void setDay(String day) { this.day = day; }
        public MealsDTO getMeals() { return meals; }
        public void setMeals(MealsDTO meals) { this.meals = meals; }
        public AlternativesDTO getAlternatives() { return alternatives; }
        public void setAlternatives(AlternativesDTO alternatives) { this.alternatives = alternatives; }
    }

    public static class MealsDTO {
        private RecipeDTO breakfast;
        private RecipeDTO lunch;
        private RecipeDTO dinner;

        public RecipeDTO getBreakfast() { return breakfast; }
        public void setBreakfast(RecipeDTO breakfast) { this.breakfast = breakfast; }
        public RecipeDTO getLunch() { return lunch; }
        public void setLunch(RecipeDTO lunch) { this.lunch = lunch; }
        public RecipeDTO getDinner() { return dinner; }
        public void setDinner(RecipeDTO dinner) { this.dinner = dinner; }
    }

    public static class AlternativesDTO {
        private List<RecipeDTO> breakfast;
        private List<RecipeDTO> lunch;
        private List<RecipeDTO> dinner;

        public List<RecipeDTO> getBreakfast() { return breakfast; }
        public void setBreakfast(List<RecipeDTO> breakfast) { this.breakfast = breakfast; }
        public List<RecipeDTO> getLunch() { return lunch; }
        public void setLunch(List<RecipeDTO> lunch) { this.lunch = lunch; }
        public List<RecipeDTO> getDinner() { return dinner; }
        public void setDinner(List<RecipeDTO> dinner) { this.dinner = dinner; }
    }
}
