package com.mydiet.backend.nutrition.dto;

import java.util.List;

public class SwapResponse {
    private RecipeDTO main;
    private List<RecipeDTO> alternatives;

    public RecipeDTO getMain() { return main; }
    public void setMain(RecipeDTO main) { this.main = main; }

    public List<RecipeDTO> getAlternatives() { return alternatives; }
    public void setAlternatives(List<RecipeDTO> alternatives) { this.alternatives = alternatives; }
}
