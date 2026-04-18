package com.mydiet.backend.nutrition.dto;

public class RecipeDTO {
    private String id;
    private String name;
    private double calories;
    private double protein;
    private double carbs;
    private double fats;
    private String image;
    private String category;
    private String totalTime;
    private String keywords;
    private String ingredients;
    private String quantities;
    private String instructions;

    public RecipeDTO() {}

    public RecipeDTO(Integer id, String name, Float calories, Float protein,
                     Float carbs, Float fats, String image, String category,
                     String totalTime, String keywords, String ingredients, String quantities, String instructions) {
        this.id = id == null ? "" : String.valueOf(id);
        this.name = name;
        this.calories = calories != null ? calories : 0f;
        this.protein = protein != null ? protein : 0f;
        this.carbs = carbs != null ? carbs : 0f;
        this.fats = fats != null ? fats : 0f;
        this.image = image;
        this.category = category;
        this.totalTime = totalTime;
        this.keywords = keywords;
        this.ingredients = ingredients;
        this.quantities = quantities;
        this.instructions = instructions;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public double getCalories() { return calories; }
    public void setCalories(double calories) { this.calories = calories; }

    public double getProtein() { return protein; }
    public void setProtein(double protein) { this.protein = protein; }

    public double getCarbs() { return carbs; }
    public void setCarbs(double carbs) { this.carbs = carbs; }

    public double getFats() { return fats; }
    public void setFats(double fats) { this.fats = fats; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getTotalTime() { return totalTime; }
    public void setTotalTime(String totalTime) { this.totalTime = totalTime; }

    public String getKeywords() { return keywords; }
    public void setKeywords(String keywords) { this.keywords = keywords; }

    public String getIngredients() { return ingredients; }
    public void setIngredients(String ingredients) { this.ingredients = ingredients; }

    public String getQuantities() { return quantities; }
    public void setQuantities(String quantities) { this.quantities = quantities; }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }
}