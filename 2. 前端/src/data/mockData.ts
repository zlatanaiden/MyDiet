// ===================== TYPES =====================
export interface Meal {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fats: number
  image: string
  checked: boolean
  category?: string
  totalTime?: string
  keywords?: string[]
  ingredients?: string[]
  quantities?: string[]
  instructions?: string[]
  allergens?: string[]
}

export interface DayMeals {
  breakfast: Meal
  lunch: Meal
  dinner: Meal
}

export interface Alternative {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fats: number
  image: string
  category?: string
  totalTime?: string
  keywords?: string[]
  ingredients?: string[]
  quantities?: string[]
  instructions?: string[]
  allergens?: string[]
}

export interface DayPlan {
  day: string
  meals: DayMeals
  alternatives: {
    breakfast: Alternative[]
    lunch: Alternative[]
    dinner: Alternative[]
  }
}

export interface Post {
  id: string
  title: string
  image: string
  author: string
  authorId?: string
  avatarGradient: string
  likes: number
  liked: boolean
  tags: string[]
  content: string
  comments: Comment[]
  nutrition?: { calories: number; protein: number; carbs: number; fats: number }
}

export interface Comment {
  id: string
  author: string
  authorId?: string
  avatarGradient: string
  text: string
  likes: number
  time: string
  liked?: boolean
  replies?: Comment[]
}

export interface UserProfile {
  name: string
  uid: string
  avatar: string
  age: number
  gender: string
  height: number
  weight: number
  targetWeight: number
  goal: 'lose' | 'gain' | 'maintain'
  activityLevel: string
  allergies: string[]
  restrictions: string[]
  bmi: number
  daysRemaining: number
  posts: number
  totalLikes: number
  savedRecipes: number
  followers: number
  following: number
  followingList?: string[]
}

export interface WeightEntry {
  day: string
  weight: number
  bodyFat?: number
}

// ===================== MOCK DATA =====================

export const mealImages = {
  oatmeal: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&h=300&fit=crop',
  chickenSalad: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
  grilledSalmon: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
  greekYogurt: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop',
  quinoaBowl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
  stirFry: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop',
  smoothie: 'https://images.unsplash.com/photo-1502741224143-90386d7f8c82?w=400&h=300&fit=crop',
  avocadoToast: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=300&fit=crop',
  tofuBowl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
  shrimpPasta: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop',
  turkeyWrap: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop',
  beefStew: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop',
}

export const defaultNutrition = {
  calories: { current: 1847, target: 2200 },
  protein: { current: 92, target: 130, color: '#4ADE80' },
  carbs: { current: 210, target: 280, color: '#22D3EE' },
  fats: { current: 58, target: 73, color: '#F97316' },
}

export const todayMeals: DayMeals = {
  breakfast: {
    id: 'b1', name: 'Oatmeal Bowl', calories: 380, protein: 14, carbs: 58, fats: 9,
    image: mealImages.oatmeal, checked: false,
    allergens: ['gluten'],
  },
  lunch: {
    id: 'l1', name: 'Chicken Salad', calories: 520, protein: 42, carbs: 35, fats: 22,
    image: mealImages.chickenSalad, checked: false,
    allergens: [],
  },
  dinner: {
    id: 'd1', name: 'Grilled Salmon', calories: 480, protein: 38, carbs: 28, fats: 18,
    image: mealImages.grilledSalmon, checked: false,
    allergens: ['fish'],
  },
}

export const weeklyPlan: DayPlan[] = [
  {
    day: 'Monday',
    meals: {
      breakfast: { id: 'mon-b', name: 'Oatmeal Bowl', calories: 380, protein: 14, carbs: 58, fats: 9, image: mealImages.oatmeal, checked: false },
      lunch: { id: 'mon-l', name: 'Chicken Salad', calories: 520, protein: 42, carbs: 35, fats: 22, image: mealImages.chickenSalad, checked: false },
      dinner: { id: 'mon-d', name: 'Grilled Salmon', calories: 480, protein: 38, carbs: 28, fats: 18, image: mealImages.grilledSalmon, checked: false },
    },
    alternatives: {
      breakfast: [
        { id: 'mon-ba1', name: 'Greek Yogurt Parfait', calories: 340, protein: 18, carbs: 42, fats: 12, image: mealImages.greekYogurt },
        { id: 'mon-ba2', name: 'Avocado Toast', calories: 360, protein: 12, carbs: 38, fats: 18, image: mealImages.avocadoToast },
        { id: 'mon-ba3', name: 'Smoothie Bowl', calories: 320, protein: 16, carbs: 48, fats: 8, image: mealImages.smoothie },
      ],
      lunch: [
        { id: 'mon-la1', name: 'Quinoa Bowl', calories: 490, protein: 22, carbs: 62, fats: 16, image: mealImages.quinoaBowl },
        { id: 'mon-la2', name: 'Turkey Wrap', calories: 450, protein: 35, carbs: 40, fats: 15, image: mealImages.turkeyWrap },
      ],
      dinner: [
        { id: 'mon-da1', name: 'Stir Fry Tofu', calories: 420, protein: 28, carbs: 45, fats: 14, image: mealImages.tofuBowl },
        { id: 'mon-da2', name: 'Shrimp Pasta', calories: 510, protein: 32, carbs: 55, fats: 16, image: mealImages.shrimpPasta },
      ],
    },
  },
  {
    day: 'Tuesday',
    meals: {
      breakfast: { id: 'tue-b', name: 'Smoothie Bowl', calories: 320, protein: 16, carbs: 48, fats: 8, image: mealImages.smoothie, checked: false },
      lunch: { id: 'tue-l', name: 'Quinoa Bowl', calories: 490, protein: 22, carbs: 62, fats: 16, image: mealImages.quinoaBowl, checked: false },
      dinner: { id: 'tue-d', name: 'Stir Fry Veggies', calories: 420, protein: 28, carbs: 45, fats: 14, image: mealImages.stirFry, checked: false },
    },
    alternatives: {
      breakfast: [{ id: 'tue-ba1', name: 'Oatmeal Bowl', calories: 380, protein: 14, carbs: 58, fats: 9, image: mealImages.oatmeal }],
      lunch: [{ id: 'tue-la1', name: 'Chicken Salad', calories: 520, protein: 42, carbs: 35, fats: 22, image: mealImages.chickenSalad }],
      dinner: [{ id: 'tue-da1', name: 'Grilled Salmon', calories: 480, protein: 38, carbs: 28, fats: 18, image: mealImages.grilledSalmon }],
    },
  },
  {
    day: 'Wednesday',
    meals: {
      breakfast: { id: 'wed-b', name: 'Avocado Toast', calories: 360, protein: 12, carbs: 38, fats: 18, image: mealImages.avocadoToast, checked: false },
      lunch: { id: 'wed-l', name: 'Turkey Wrap', calories: 450, protein: 35, carbs: 40, fats: 15, image: mealImages.turkeyWrap, checked: false },
      dinner: { id: 'wed-d', name: 'Beef Stew', calories: 550, protein: 40, carbs: 42, fats: 20, image: mealImages.beefStew, checked: false },
    },
    alternatives: {
      breakfast: [{ id: 'wed-ba1', name: 'Greek Yogurt Parfait', calories: 340, protein: 18, carbs: 42, fats: 12, image: mealImages.greekYogurt }],
      lunch: [{ id: 'wed-la1', name: 'Quinoa Bowl', calories: 490, protein: 22, carbs: 62, fats: 16, image: mealImages.quinoaBowl }],
      dinner: [{ id: 'wed-da1', name: 'Shrimp Pasta', calories: 510, protein: 32, carbs: 55, fats: 16, image: mealImages.shrimpPasta }],
    },
  },
  {
    day: 'Thursday',
    meals: {
      breakfast: { id: 'thu-b', name: 'Greek Yogurt Parfait', calories: 340, protein: 18, carbs: 42, fats: 12, image: mealImages.greekYogurt, checked: false },
      lunch: { id: 'thu-l', name: 'Chicken Salad', calories: 520, protein: 42, carbs: 35, fats: 22, image: mealImages.chickenSalad, checked: false },
      dinner: { id: 'thu-d', name: 'Shrimp Pasta', calories: 510, protein: 32, carbs: 55, fats: 16, image: mealImages.shrimpPasta, checked: false },
    },
    alternatives: {
      breakfast: [{ id: 'thu-ba1', name: 'Oatmeal Bowl', calories: 380, protein: 14, carbs: 58, fats: 9, image: mealImages.oatmeal }],
      lunch: [{ id: 'thu-la1', name: 'Turkey Wrap', calories: 450, protein: 35, carbs: 40, fats: 15, image: mealImages.turkeyWrap }],
      dinner: [{ id: 'thu-da1', name: 'Grilled Salmon', calories: 480, protein: 38, carbs: 28, fats: 18, image: mealImages.grilledSalmon }],
    },
  },
  {
    day: 'Friday',
    meals: {
      breakfast: { id: 'fri-b', name: 'Smoothie Bowl', calories: 320, protein: 16, carbs: 48, fats: 8, image: mealImages.smoothie, checked: false },
      lunch: { id: 'fri-l', name: 'Quinoa Bowl', calories: 490, protein: 22, carbs: 62, fats: 16, image: mealImages.quinoaBowl, checked: false },
      dinner: { id: 'fri-d', name: 'Grilled Salmon', calories: 480, protein: 38, carbs: 28, fats: 18, image: mealImages.grilledSalmon, checked: false },
    },
    alternatives: {
      breakfast: [{ id: 'fri-ba1', name: 'Avocado Toast', calories: 360, protein: 12, carbs: 38, fats: 18, image: mealImages.avocadoToast }],
      lunch: [{ id: 'fri-la1', name: 'Chicken Salad', calories: 520, protein: 42, carbs: 35, fats: 22, image: mealImages.chickenSalad }],
      dinner: [{ id: 'fri-da1', name: 'Stir Fry Tofu', calories: 420, protein: 28, carbs: 45, fats: 14, image: mealImages.tofuBowl }],
    },
  },
  {
    day: 'Saturday',
    meals: {
      breakfast: { id: 'sat-b', name: 'Oatmeal Bowl', calories: 380, protein: 14, carbs: 58, fats: 9, image: mealImages.oatmeal, checked: false },
      lunch: { id: 'sat-l', name: 'Turkey Wrap', calories: 450, protein: 35, carbs: 40, fats: 15, image: mealImages.turkeyWrap, checked: false },
      dinner: { id: 'sat-d', name: 'Beef Stew', calories: 550, protein: 40, carbs: 42, fats: 20, image: mealImages.beefStew, checked: false },
    },
    alternatives: {
      breakfast: [{ id: 'sat-ba1', name: 'Greek Yogurt Parfait', calories: 340, protein: 18, carbs: 42, fats: 12, image: mealImages.greekYogurt }],
      lunch: [{ id: 'sat-la1', name: 'Quinoa Bowl', calories: 490, protein: 22, carbs: 62, fats: 16, image: mealImages.quinoaBowl }],
      dinner: [{ id: 'sat-da1', name: 'Shrimp Pasta', calories: 510, protein: 32, carbs: 55, fats: 16, image: mealImages.shrimpPasta }],
    },
  },
  {
    day: 'Sunday',
    meals: {
      breakfast: { id: 'sun-b', name: 'Avocado Toast', calories: 360, protein: 12, carbs: 38, fats: 18, image: mealImages.avocadoToast, checked: false },
      lunch: { id: 'sun-l', name: 'Chicken Salad', calories: 520, protein: 42, carbs: 35, fats: 22, image: mealImages.chickenSalad, checked: false },
      dinner: { id: 'sun-d', name: 'Stir Fry Veggies', calories: 420, protein: 28, carbs: 45, fats: 14, image: mealImages.stirFry, checked: false },
    },
    alternatives: {
      breakfast: [{ id: 'sun-ba1', name: 'Smoothie Bowl', calories: 320, protein: 16, carbs: 48, fats: 8, image: mealImages.smoothie }],
      lunch: [{ id: 'sun-la1', name: 'Turkey Wrap', calories: 450, protein: 35, carbs: 40, fats: 15, image: mealImages.turkeyWrap }],
      dinner: [{ id: 'sun-da1', name: 'Grilled Salmon', calories: 480, protein: 38, carbs: 28, fats: 18, image: mealImages.grilledSalmon }],
    },
  },
]

export const communityPosts: Post[] = [
  {
    id: 'p1', title: '30-Day Fat Loss Journey: Week 2 Results!',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=500&fit=crop',
    author: 'Sarah_Fit', avatarGradient: 'from-[#FBBF24] to-[#F97316]',
    likes: 3245, liked: false, tags: ['#30DayFatLoss'],
    content: 'Week 2 is done! Down 3.5kg already. The meal plans from MyDiet have been incredible...',
    comments: [
      { id: 'c1', author: 'HealthyMike', avatarGradient: 'from-[#4ADE80] to-[#22D3EE]', text: 'Amazing progress! Keep going!', likes: 24, time: '2h ago' },
      { id: 'c2', author: 'FitJourney', avatarGradient: 'from-[#F472B6] to-[#818CF8]', text: 'What is your daily calorie target?', likes: 8, time: '1h ago' },
      { id: 'c3', author: 'NutritionPro', avatarGradient: 'from-[#FBBF24] to-[#22D3EE]', text: 'The consistency is key. Well done!', likes: 15, time: '45min ago' },
    ],
  },
  {
    id: 'p2', title: 'Low-Cal Quick Dinner: Under 400kcal',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=350&fit=crop',
    author: 'HealthyEats_Amy', avatarGradient: 'from-[#FBBF24] to-[#F97316]',
    likes: 2100, liked: false, tags: ['#LowCalDinner', '#QuickMeals'],
    content: 'This grilled salmon with roasted veggies is only 380 calories and takes 15 minutes!',
    nutrition: { calories: 380, protein: 35, carbs: 22, fats: 16 },
    comments: [
      { id: 'c4', author: 'ChefMike', avatarGradient: 'from-[#4ADE80] to-[#22D3EE]', text: 'Looks delicious! Saving this recipe.', likes: 32, time: '3h ago' },
      { id: 'c5', author: 'DietNewbie', avatarGradient: 'from-[#818CF8] to-[#F472B6]', text: 'Can I substitute the salmon?', likes: 5, time: '2h ago' },
    ],
  },
  {
    id: 'p3', title: 'Before & After: 3 Months of Clean Eating',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=500&fit=crop',
    author: 'JourneyLoves', avatarGradient: 'from-[#4ADE80] to-[#22D3EE]',
    likes: 5600, liked: false, tags: ['#Transformation', '#CleanEating'],
    content: 'Three months ago I started tracking with MyDiet. The results speak for themselves...',
    comments: [
      { id: 'c6', author: 'InspiredBy', avatarGradient: 'from-[#F97316] to-[#FBBF24]', text: 'This is so inspiring! Thank you for sharing.', likes: 45, time: '5h ago' },
    ],
  },
  {
    id: 'p4', title: 'Easy 15-Min Protein Bowl',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    author: 'ChefMike', avatarGradient: 'from-[#4ADE80] to-[#22D3EE]',
    likes: 1800, liked: false, tags: ['#QuickMeals', '#HighProtein'],
    content: 'Quick, easy, and packed with 40g protein. Perfect post-workout meal.',
    comments: [],
  },
  {
    id: 'p5', title: 'My Meal Prep Sunday Routine',
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=400&fit=crop',
    author: 'PrepQueen_Jen', avatarGradient: 'from-[#818CF8] to-[#F472B6]',
    likes: 890, liked: false, tags: ['#MealPrep'],
    content: 'Every Sunday I spend 2 hours prepping meals for the entire week.',
    comments: [],
  },
  {
    id: 'p6', title: 'Zero-Sugar Dessert That Actually Tastes Good',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=350&fit=crop',
    author: 'SweetTooth_Lisa', avatarGradient: 'from-[#F472B6] to-[#818CF8]',
    likes: 1200, liked: false, tags: ['#SugarFree', '#HealthyDessert'],
    content: 'Greek yogurt parfait with berries and a drizzle of honey. Guilt-free indulgence.',
    comments: [],
  },
  {
    id: 'p7', title: 'Greek Yogurt Parfait Under 200kcal',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop',
    author: 'FitFoodie_Eve', avatarGradient: 'from-[#22D3EE] to-[#4ADE80]',
    likes: 750, liked: false, tags: ['#LowCal'],
    content: 'Under 200 calories and it tastes amazing!',
    comments: [],
  },
  {
    id: 'p8', title: 'How I Lost 25kg While Still Eating Pasta',
    image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=350&fit=crop',
    author: 'PastaLover_Alex', avatarGradient: 'from-[#F97316] to-[#FBBF24]',
    likes: 4200, liked: false, tags: ['#Transformation', '#Pasta'],
    content: 'You do not have to give up what you love. Just learn portion control.',
    comments: [],
  },
  {
    id: 'p9', title: 'Smoothie Bowl Art: Make It Beautiful',
    image: 'https://images.unsplash.com/photo-1502741224143-90386d7f8c82?w=400&h=400&fit=crop',
    author: 'BowlArt_May', avatarGradient: 'from-[#818CF8] to-[#22D3EE]',
    likes: 960, liked: false, tags: ['#FoodArt', '#Smoothie'],
    content: 'Making healthy food beautiful makes eating it so much more enjoyable.',
    comments: [],
  },
]

export const trendingPosts: Post[] = [
  {
    id: 'tp1', title: '90-Day Transformation: Lost 25kg with MyDiet!',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    author: 'Sarah_Fit', avatarGradient: 'from-[#FBBF24] to-[#F97316]',
    likes: 12400, liked: false, tags: ['#Transformation'],
    content: '90 days, 25kg lost. Completely changed my life with proper nutrition tracking.',
    comments: [],
  },
  {
    id: 'tp2', title: 'Ultimate Meal Prep Guide: 21 Meals in 2 Hours',
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=500&fit=crop',
    author: 'PrepQueen_Lily', avatarGradient: 'from-[#4ADE80] to-[#22D3EE]',
    likes: 9800, liked: false, tags: ['#MealPrep'],
    content: 'Complete guide to efficient meal prepping for the entire week.',
    comments: [],
  },
  {
    id: 'tp3', title: '5 Protein Smoothie Bowls That Taste Like Dessert',
    image: 'https://images.unsplash.com/photo-1502741224143-90386d7f8c82?w=400&h=350&fit=crop',
    author: 'Smoothie_Guru', avatarGradient: 'from-[#FBBF24] to-[#F97316]',
    likes: 8200, liked: false, tags: ['#HealthyDessert'],
    content: 'Who says healthy cant taste amazing? These bowls are proof.',
    comments: [],
  },
  {
    id: 'tp4', title: 'How Running 5K Daily Changed My Metabolism',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop',
    author: 'RunnerGirl_Zoe', avatarGradient: 'from-[#22D3EE] to-[#818CF8]',
    likes: 6100, liked: false, tags: ['#Cardio'],
    content: 'Adding a daily 5K run to my routine completely changed my metabolism.',
    comments: [],
  },
  {
    id: 'tp5', title: '30-Day No Sugar Challenge: Before & After',
    image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=350&fit=crop',
    author: 'CleanLife_Tom', avatarGradient: 'from-[#4ADE80] to-[#FBBF24]',
    likes: 5600, liked: false, tags: ['#SugarFree'],
    content: 'Cutting sugar for 30 days was the hardest and best thing I have done.',
    comments: [],
  },
  {
    id: 'tp6', title: 'Why I Track Every Meal: My 6-Month Review',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=400&fit=crop',
    author: 'Honest_Emma', avatarGradient: 'from-[#F472B6] to-[#F97316]',
    likes: 4300, liked: false, tags: ['#CalorieTracking'],
    content: 'Six months of tracking every single meal. Here is what I learned.',
    comments: [],
  },
  {
    id: 'tp7', title: 'Yoga + Clean Eating: Sustainable Weight Loss',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=350&fit=crop',
    author: 'ZenEater_Mia', avatarGradient: 'from-[#818CF8] to-[#F472B6]',
    likes: 3800, liked: false, tags: ['#MindfulEating'],
    content: 'Combining yoga with clean eating has been a game changer.',
    comments: [],
  },
  {
    id: 'tp8', title: 'Top 10 Breakfasts Under 300 Calories',
    image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&h=400&fit=crop',
    author: 'MorningFuel_Jay', avatarGradient: 'from-[#FBBF24] to-[#22D3EE]',
    likes: 3200, liked: false, tags: ['#Breakfast'],
    content: 'Start your day right with these low calorie breakfast options.',
    comments: [],
  },
  {
    id: 'tp9', title: 'Acai Bowl Art: Making Healthy Look Beautiful',
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=400&fit=crop',
    author: 'BowlQueen_Ava', avatarGradient: 'from-[#818CF8] to-[#22D3EE]',
    likes: 7500, liked: false, tags: ['#FoodArt'],
    content: 'Food should look as good as it tastes!',
    comments: [],
  },
  {
    id: 'tp10', title: 'Strength Training + Diet: 12-Week Guide',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=350&fit=crop',
    author: 'IronChef_Dan', avatarGradient: 'from-[#F97316] to-[#FBBF24]',
    likes: 4700, liked: false, tags: ['#GainWeight'],
    content: 'Complete 12 week guide to gaining lean muscle mass.',
    comments: [],
  },
  {
    id: 'tp11', title: '7-Day Detox Juice Cleanse Results',
    image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=300&fit=crop',
    author: 'JuicyLife_Nia', avatarGradient: 'from-[#4ADE80] to-[#818CF8]',
    likes: 2100, liked: false, tags: ['#Detox'],
    content: 'Seven days of juicing: my honest results and experience.',
    comments: [],
  },
  {
    id: 'tp12', title: 'My Go-To 15-Minute Energizing Lunch',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=350&fit=crop',
    author: 'LunchBox_Kate', avatarGradient: 'from-[#22D3EE] to-[#4ADE80]',
    likes: 2900, liked: false, tags: ['#QuickLunch'],
    content: 'Fifteen minutes is all you need for a nutritious lunch.',
    comments: [],
  },
]

export const trendingTags = [
  { name: '#30DayFatLoss', posts: '2.8k', active: true },
  { name: '#MealPrepSunday', posts: '1.2k', active: false },
  { name: '#GainWeight', posts: '1.1k', active: false },
  { name: '#StayHealthy', posts: '2.3k', active: false },
]

export const topContributors = [
  { name: 'Sarah_Fit', score: '12.4k', gradient: 'from-[#FBBF24] to-[#F97316]' },
  { name: 'ChefMike', score: '9.8k', gradient: 'from-[#4ADE80] to-[#22D3EE]' },
  { name: 'JennyLoses', score: '7.2k', gradient: 'from-[#F472B6] to-[#818CF8]' },
]

export const defaultUser: UserProfile = {
  name: 'Yiming',
  uid: 'UID-20250209',
  avatar: '',
  age: 22,
  gender: 'Male',
  height: 178,
  weight: 75,
  targetWeight: 68,
  goal: 'lose',
  activityLevel: 'Moderate',
  allergies: ['Peanuts', 'Shellfish'],
  restrictions: ['Low Sodium'],
  bmi: 23.7,
  daysRemaining: 45,
  posts: 12,
  totalLikes: 458,
  savedRecipes: 24,
  followers: 236,
  following: 189,
  followingList: [],
}

export const weightHistory: WeightEntry[] = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  weight: 78 - (i * 0.12) + (Math.random() * 0.6 - 0.3),
  bodyFat: 22 - (i * 0.08) + (Math.random() * 0.4 - 0.2),
}))

export const identifierFoods = [
  { name: 'Grilled Chicken Breast', weight: '150g', calories: 248, confidence: 95 },
  { name: 'Brown Rice', weight: '120g', calories: 144, confidence: 90 },
  { name: 'Steamed Broccoli', weight: '80g', calories: 28, confidence: 92 },
  { name: 'Olive Oil Dressing', weight: '15ml', calories: 120, confidence: 78 },
]
