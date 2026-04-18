const API_BASE = 'https://mydiet-l8vb.onrender.com'

// ── Request / Response types matching backend DTOs ──

export interface GenerateRequest {
  age: number
  gender: string
  weightKg: number
  heightCm: number
  activityLevel: string   // "sedentary" | "light" | "moderate" | "active" | "veryActive"
  goal: string            // "lose" | "gain" | "maintain"
  allergies: string[]
}

export interface RecipeDTO {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fats: number
  image: string
  category: string
  totalTime: string | null
  keywords: string | null
  ingredients: string | null
  quantities: string | null
  instructions: string | null
}

export interface DailyTargetsDTO {
  calories: number
  protein: number
  carbs: number
  fats: number
  fiber: number
}

export interface DayPlanDTO {
  day: string
  meals: { breakfast: RecipeDTO; lunch: RecipeDTO; dinner: RecipeDTO }
  alternatives: { breakfast: RecipeDTO[]; lunch: RecipeDTO[]; dinner: RecipeDTO[] }
}

export interface GenerateResponse {
  bmr: number
  tdee: number
  targets: DailyTargetsDTO
  weeklyPlan: DayPlanDTO[]
}

export interface SwapRequest {
  targetCalories: number
  tdee: number
  mealType: string        // "breakfast" | "lunch" | "dinner"
  allergies: string[]
  excludeIds: number[]
}

export interface SwapResponse {
  main: RecipeDTO
  alternatives: RecipeDTO[]
}

// ── API calls ──

export async function generateMealPlan(req: GenerateRequest): Promise<GenerateResponse> {
  const resp = await fetch(`${API_BASE}/api/meal-plan/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!resp.ok) throw new Error(`Generate failed: ${resp.status}`)
  return resp.json()
}

export async function swapMealApi(req: SwapRequest): Promise<SwapResponse> {
  const resp = await fetch(`${API_BASE}/api/meal-plan/swap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!resp.ok) throw new Error(`Swap failed: ${resp.status}`)
  return resp.json()
}
