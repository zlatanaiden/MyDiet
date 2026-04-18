import type { Meal, DayPlan } from './mockData'

export type Gender = 'Male' | 'Female' | 'Both'

export type ActivityLevel =
  | 'sedentaryOrLight'
  | 'activeOrModerately'
  | 'vigorousOrVigorouslyActiveLifestyle'

export interface UserBaselines {
  age: number
  gender: Gender
  weightKg: number
  heightCm: number
  activityLevel: ActivityLevel
  isPregnant?: boolean
  isLactating?: boolean
  /**
   * List of allergens (e.g. "peanuts", "shellfish", "gluten") to filter out.
   */
  allergies?: string[]
}

export interface DailyTargets {
  calories: number
  protein: number
  carbs: number
  fats?: number
  fiber?: number
  waterL?: number
  bmr: number
  tdee: number
}

const PAL_VALUES: Record<ActivityLevel, number> = {
  // FAO/WHO/UNU 2004 表 5.1 典型 PAL 范围，取一个代表值
  sedentaryOrLight: 1.55,
  activeOrModerately: 1.8,
  vigorousOrVigorouslyActiveLifestyle: 2.2,
}

// --- BMR / TEE 计算器 ---

/**
 * 成年人：Mifflin-St Jeor 计算基础代谢率（BMR）。
 * TEE = BMR × PAL（参考 FAO/WHO/UNU 2004 表 5.1）。
 */
export function calculateAdultBmr({
  weightKg,
  heightCm,
  age,
  gender,
}: {
  weightKg: number
  heightCm: number
  age: number
  gender: Gender
}) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return gender === 'Male' ? base + 5 : base - 161
}

/**
 * 婴幼儿（0-3岁）：使用 FAO 2004 表 3.3 的 TEE 计算公式。
 * 这里简化为：BMR≈89×体重-100，然后乘以 PAL=1.4。
 */
export function calculateInfantTee({ weightKg }: { weightKg: number }) {
  // FAO/WHO/UNU 2004：婴幼儿 BMR ≈ 89 * 体重(kg) - 100
  const bmr = 89 * weightKg - 100
  const pal = 1.4
  return bmr * pal
}

/**
 * 青少年：使用 FAO 2004 基于 Schofield 的计算（近似公式 4.2）。
 * 最终 TEE = BMR × PAL。
 */
export function calculateAdolescentBmr({
  age,
  weightKg,
  gender,
}: {
  age: number
  weightKg: number
  gender: Gender
}) {
  if (age < 10) {
    // 10 岁以下：使用 Schofield 3-10 岁公式（近似）
    if (gender === 'Male') {
      return 22.7 * weightKg + 495
    }
    return 22.5 * weightKg + 499
  }

  // 10-18 岁：Schofield 青少年公式
  if (gender === 'Male') {
    return 17.5 * weightKg + 651
  }
  return 12.2 * weightKg + 746
}

export function calculateTdee(
  bmr: number,
  activityLevel: ActivityLevel,
  overridePal?: number
) {
  const pal = overridePal ?? PAL_VALUES[activityLevel]
  return bmr * pal
}

// --- DRI 表（部分，需时可补全更多行） ---
interface DriRow {
  category: string
  gender: Gender
  minAge: number
  maxAge: number
  protein_g_day: number
  carbohydrate_g_day: number
  fiber_g_day: number | null
  water_L_day: number | null
  target_calories_kcal: number
}

const DRI_TABLE: DriRow[] = [
  {
    category: 'Infants',
    gender: 'Both',
    minAge: 0,
    maxAge: 0.5,
    protein_g_day: 9.1,
    carbohydrate_g_day: 60,
    fiber_g_day: null,
    water_L_day: 0.7,
    target_calories_kcal: 550,
  },
  {
    category: 'Infants',
    gender: 'Both',
    minAge: 0.5,
    maxAge: 1,
    protein_g_day: 11,
    carbohydrate_g_day: 95,
    fiber_g_day: null,
    water_L_day: 0.8,
    target_calories_kcal: 700,
  },
  {
    category: 'Children',
    gender: 'Both',
    minAge: 1,
    maxAge: 3,
    protein_g_day: 13,
    carbohydrate_g_day: 130,
    fiber_g_day: 19,
    water_L_day: 1.3,
    target_calories_kcal: 1000,
  },
  {
    category: 'Children',
    gender: 'Both',
    minAge: 4,
    maxAge: 8,
    protein_g_day: 19,
    carbohydrate_g_day: 130,
    fiber_g_day: 25,
    water_L_day: 1.7,
    target_calories_kcal: 1400,
  },
  {
    category: 'Adolescents',
    gender: 'Male',
    minAge: 9,
    maxAge: 13,
    protein_g_day: 34,
    carbohydrate_g_day: 130,
    fiber_g_day: 31,
    water_L_day: 2.4,
    target_calories_kcal: 1800,
  },
  {
    category: 'Adolescents',
    gender: 'Female',
    minAge: 9,
    maxAge: 13,
    protein_g_day: 34,
    carbohydrate_g_day: 130,
    fiber_g_day: 26,
    water_L_day: 2.1,
    target_calories_kcal: 1600,
  },
  {
    category: 'Adults',
    gender: 'Male',
    minAge: 19,
    maxAge: 50,
    protein_g_day: 56,
    carbohydrate_g_day: 130,
    fiber_g_day: 38,
    water_L_day: 3.7,
    target_calories_kcal: 2600,
  },
  {
    category: 'Adults',
    gender: 'Female',
    minAge: 19,
    maxAge: 50,
    protein_g_day: 46,
    carbohydrate_g_day: 130,
    fiber_g_day: 25,
    water_L_day: 2.7,
    target_calories_kcal: 2000,
  },
]

function findDriRow(age: number, gender: Gender) {
  const matches = DRI_TABLE.filter((row) => {
    const genderMatch = row.gender === gender || row.gender === 'Both'
    return genderMatch && age >= row.minAge && age <= row.maxAge
  })
  return matches[0] ?? null
}

export function getDailyTargets(baseline: UserBaselines): DailyTargets {
  const isInfant = baseline.age < 2
  const isAdolescent = baseline.age >= 2 && baseline.age < 19
  const isAdult = baseline.age >= 19

  let bmr = 0
  let tdee = 0

  if (isInfant) {
    tdee = calculateInfantTee({ weightKg: baseline.weightKg })
    // 估算 BMR：TEE / 1.4
    bmr = tdee / 1.4
  } else if (isAdolescent) {
    bmr = calculateAdolescentBmr({
      age: baseline.age,
      weightKg: baseline.weightKg,
      gender: baseline.gender,
    })
    tdee = calculateTdee(bmr, baseline.activityLevel)
  } else {
    bmr = calculateAdultBmr({
      age: baseline.age,
      weightKg: baseline.weightKg,
      heightCm: baseline.heightCm,
      gender: baseline.gender,
    })
    tdee = calculateTdee(bmr, baseline.activityLevel)
  }

  const dri = findDriRow(baseline.age, baseline.gender)

  return {
    calories: Math.round(tdee),
    protein: dri?.protein_g_day ?? 0,
    carbs: dri?.carbohydrate_g_day ?? 0,
    fats: undefined,
    fiber: dri?.fiber_g_day ?? undefined,
    waterL: dri?.water_L_day ?? undefined,
    bmr,
    tdee,
  }
}

// --- 优化（最小平方和） ---

function leastSquaresScore(
  mealTotals: { calories: number; protein: number; carbs: number; fats: number },
  targets: { calories: number; protein: number; carbs: number; fats: number }
) {
  const norm = (value: number, target: number) => {
    if (!target || isNaN(target) || target === 0) return 0
    const diff = value - target
    return diff / target
  }

  const deltas = [
    norm(mealTotals.calories, targets.calories),
    norm(mealTotals.protein, targets.protein),
    norm(mealTotals.carbs, targets.carbs),
    norm(mealTotals.fats, targets.fats),
  ]
  return deltas.reduce((sum, v) => sum + v * v, 0)
}

function isMealSafe(meal: Meal, allergies?: string[]) {
  if (!allergies || allergies.length === 0) return true
  if (!meal.allergens || meal.allergens.length === 0) return true

  const mealAllergens = meal.allergens.map((a) => a.trim().toLowerCase())
  const userAllergies = allergies.map((a) => a.trim().toLowerCase())

  // 模糊匹配：如果用户过敏源是 "nut"，则要匹配到 "nuts" 等情况。
  const matches = userAllergies.some((userAllergy) =>
    mealAllergens.some(
      (mealAllergy) =>
        mealAllergy.includes(userAllergy) || userAllergy.includes(mealAllergy)
    )
  )

  return !matches
}

export function suggestDayPlan(
  meals: Meal[],
  targets: DailyTargets,
  allergies?: string[]
): DayPlan | null {
  const safeMeals = meals.filter((meal) => isMealSafe(meal, allergies))
  if (safeMeals.length < 3) return null

  const target = {
    calories: targets.calories,
    protein: targets.protein,
    carbs: targets.carbs,
    fats: targets.fats ?? 0,
  }

  let best: { score: number; plan: DayPlan } | null = null

  for (let i = 0; i < safeMeals.length; i += 1) {
    for (let j = i + 1; j < safeMeals.length; j += 1) {
      for (let k = j + 1; k < safeMeals.length; k += 1) {
        const breakfast = safeMeals[i]
        const lunch = safeMeals[j]
        const dinner = safeMeals[k]

        const totals = {
          calories: breakfast.calories + lunch.calories + dinner.calories,
          protein: breakfast.protein + lunch.protein + dinner.protein,
          carbs: breakfast.carbs + lunch.carbs + dinner.carbs,
          fats: breakfast.fats + lunch.fats + dinner.fats,
        }

        const score = leastSquaresScore(totals, target)
        const plan: DayPlan = {
          day: 'Suggested',
          meals: { breakfast, lunch, dinner },
          alternatives: { breakfast: [], lunch: [], dinner: [] },
        }

        if (!best || score < best.score) {
          best = { score, plan }
        }
      }
    }
  }

  return best?.plan ?? null
}
