import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { defaultUser, todayMeals, weeklyPlan, communityPosts, trendingPosts, type UserProfile, type DayMeals, type DayPlan, type Post, type Comment } from '../data/mockData'

interface NutritionData {
  calories: { current: number; target: number }
  protein: { current: number; target: number; color: string }
  carbs: { current: number; target: number; color: string }
  fats: { current: number; target: number; color: string }
}

export interface ExtraMeal {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fats: number
}

export interface AuthResult {
  success: boolean
  message?: string
}

// Per-date storage for nutrition & meals
interface DailyRecord {
  nutrition: NutritionData
  meals: DayMeals
  extraMeals: ExtraMeal[]
}

function getDateKey(year: number, month: number, day: number): string {
  return `${year}-${month}-${day}`
}

// Get day-of-week name from a full date
function getDayName(year: number, month: number, day: number): string {
  const date = new Date(year, month, day)
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[date.getDay()]
}

// Empty nutrition (0 consumed) for fresh dates
function makeEmptyNutrition(): NutritionData {
  return {
    calories: { current: 0, target: 2200 },
    protein: { current: 0, target: 130, color: '#4ADE80' },
    carbs: { current: 0, target: 280, color: '#22D3EE' },
    fats: { current: 0, target: 73, color: '#F97316' },
  }
}

function makeFreshMeals(): DayMeals {
  return JSON.parse(JSON.stringify(todayMeals))
}

// Create default record with meals from weekly plan based on day of week
function makeMealsFromPlan(planData: DayPlan[], dayName: string): DayMeals {
  const dayPlan = planData.find(d => d.day === dayName)
  if (dayPlan) {
    return JSON.parse(JSON.stringify(dayPlan.meals))
  }
  return makeFreshMeals()
}

interface AppContextType {
  user: UserProfile
  nutrition: NutritionData
  streak: number
  streakCheckedToday: boolean
  meals: DayMeals
  weeklyPlan: DayPlan[]
  planCompleted: boolean
  unit: 'metric' | 'imperial'
  selectedDate: number
  selectedMonth: number
  selectedYear: number
  isToday: boolean
  isLoggedIn: boolean
  // Community state
  posts: Post[]
  trendingPostsList: Post[]
  setUser: (u: UserProfile) => void
  updateWeight: (w: number) => void
  toggleMealCheck: (mealType: 'breakfast' | 'lunch' | 'dinner') => void
  incrementStreak: () => void
  completePlan: () => void
  resetPlan: () => void
  setUnit: (u: 'metric' | 'imperial') => void
  setSelectedDate: (d: number) => void
  setFullDate: (year: number, month: number, day: number) => void
  resetToToday: () => void
  addNutrition: (cal: number, p: number, c: number, f: number) => void
  swapMeal: (day: string, mealType: 'breakfast' | 'lunch' | 'dinner') => void
  selectMealAlternative: (day: string, mealType: 'breakfast' | 'lunch' | 'dinner', altId: string) => void
  // Extra meals from Identifier
  extraMeals: ExtraMeal[]
  addExtraMeals: (meals: ExtraMeal[]) => void
  removeExtraMeal: (mealId: string) => void
  removeAllExtraMeals: () => void
  // Community
  toggleFollow: (username: string) => void;
  addPost: (post: Post) => void;
  addComment: (postId: string, comment: Comment) => void
  deleteComment: (postId: string, commentId: string) => void
  addReplyToComment: (postId: string, commentId: string, reply: Comment) => void
  updatePostComments: (postId: string, comments: Comment[]) => void
  refreshPosts: () => void
  togglePostLike: (postId: string) => void
  toggleCommentLike: (postId: string, commentId: string) => void
  // Auth
  signIn: (email: string, password: string, remember?: boolean) => Promise<AuthResult>
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>
  signOut: () => void
}

const AppContext = createContext<AppContextType | null>(null)

function loadState<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch { return fallback }
}

function saveState(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

interface StoredAccount {
  email: string
  password: string
  name: string
  createdAt: string
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function loadAccounts(): StoredAccount[] {
  return loadState<StoredAccount[]>('mydiet_accounts', [])
}

function saveAccounts(accounts: StoredAccount[]) {
  saveState('mydiet_accounts', accounts)
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserProfile>(() => ({ ...defaultUser, ...loadState('mydiet_user', defaultUser) }))
  const [streak, setStreak] = useState(() => loadState('mydiet_streak', 0))
  const [streakCheckedToday, setStreakCheckedToday] = useState(() => loadState('mydiet_streak_today', false))
  const [isLoggedIn, setIsLoggedIn] = useState(() => {return !!localStorage.getItem('user') || !!sessionStorage.getItem('user')})
  const [plan, setPlan] = useState<DayPlan[]>(() => loadState('mydiet_plan', weeklyPlan))
  const [planCompleted, setPlanCompleted] = useState(() => loadState('mydiet_plan_done', false))
  const [unit, setUnitState] = useState<'metric' | 'imperial'>(() => loadState('mydiet_unit', 'metric'))
  const [selectedDate, setSelectedDateState] = useState(new Date().getDate())
  const [selectedMonth, setSelectedMonthState] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYearState] = useState(new Date().getFullYear())

  // Per-date records
  const [dailyRecords, setDailyRecords] = useState<Record<string, DailyRecord>>(() =>
    loadState('mydiet_daily', {})
  )

  // Community posts initialized as empty array instead of fake data
  const [posts, setPostsState] = useState<Post[]>(() => loadState('mydiet_posts', []))
  const [trendingPostsList, setTrendingPostsState] = useState<Post[]>(() => loadState('mydiet_tposts', []))

// --- NEW: Fetch real post data from the backend ---
  useEffect(() => {
    const fetchRealPosts = async () => {
      try {
        const myDbId = localStorage.getItem('mydiet_user_db_id');
        
        const url = myDbId ? `http://localhost:8080/api/posts?userId=${myDbId}` : 'http://localhost:8080/api/posts';
        const response = await fetch(url);
        
        if (!response.ok) throw new Error('Network request failed');
        const backendData = await response.json();

        const transformedPosts: Post[] = backendData.map((bp: any) => {
          const rawIdString = String(bp.userId).padStart(6, '0');
          const displayId = `UID-${rawIdString}`;

          return {
            id: String(bp.id),
            title: bp.title,
            content: bp.content,
            image: bp.imageUrl || '',
            author: bp.authorName || (bp.userId === 1 ? 'Sarah_Fit' : (bp.userId === 2 ? 'ChefMike' : `User_${rawIdString}`)),
            authorId: displayId,
            avatarGradient: bp.authorAvatarGradient || (bp.userId === 1 ? 'from-[#FBBF24] to-[#F97316]' : (bp.userId === 2 ? 'from-[#4ADE80] to-[#22D3EE]' : 'from-[#3B82F6] to-[#8B5CF6]')),
            
            likes: bp.likes || 0,
            liked: bp.isLikedByCurrentUser === true || bp.likedByCurrentUser === true || false,
            
            tags: bp.tags ? JSON.parse(bp.tags) : [],

            comments: bp.comments ? bp.comments.map((c: any) => {
              const commentRawId = String(c.userId).padStart(6, '0');
              return {
                id: String(c.id),
                text: c.content,
                author: c.authorName || (c.userId === 1 ? 'Sarah_Fit' : (c.userId === 2 ? 'ChefMike' : `User_${commentRawId}`)),
                authorId: `UID-${commentRawId}`,
                avatarGradient: c.authorAvatarGradient || (c.userId === 1 ? 'from-[#FBBF24] to-[#F97316]' : (c.userId === 2 ? 'from-[#4ADE80] to-[#22D3EE]' : 'from-[#3B82F6] to-[#8B5CF6]')),
                time: 'Just now',
                
                likes: c.likes || 0,
                liked: c.isLikedByCurrentUser === true || c.likedByCurrentUser === true || false, 
                replies: []
              };
            }) : [],

            nutrition: bp.nutrition ? JSON.parse(bp.nutrition) : undefined
          };
        });

        setPostsState(transformedPosts);
        setTrendingPostsState(transformedPosts);
      } catch (error) {
        console.error("Oops, failed to fetch backend data.", error);
      }
    }

    fetchRealPosts();
  }, [isLoggedIn]);
  // -------------------------------------

  // Get current day's record — ALWAYS sync meal definitions from weekly plan
  const currentKey = getDateKey(selectedYear, selectedMonth, selectedDate)
  const dayName = getDayName(selectedYear, selectedMonth, selectedDate)
  const planMeals = makeMealsFromPlan(plan, dayName)
  const storedRecord = dailyRecords[currentKey]

  // Always use the plan's meal definitions, but preserve checked state from stored record
  const currentRecord: DailyRecord = storedRecord
    ? {
      ...storedRecord,
      meals: {
        breakfast: { ...planMeals.breakfast, checked: storedRecord.meals.breakfast?.checked ?? false },
        lunch: { ...planMeals.lunch, checked: storedRecord.meals.lunch?.checked ?? false },
        dinner: { ...planMeals.dinner, checked: storedRecord.meals.dinner?.checked ?? false },
      },
    }
    : { nutrition: makeEmptyNutrition(), meals: planMeals, extraMeals: [] }

  const now = new Date()
  const isToday = selectedDate === now.getDate() && selectedMonth === now.getMonth() && selectedYear === now.getFullYear()

  const updateDailyRecord = useCallback((dateKey: string, updater: (prev: DailyRecord) => DailyRecord) => {
    setDailyRecords(prev => {
      const existing = prev[dateKey] || { nutrition: makeEmptyNutrition(), meals: makeFreshMeals(), extraMeals: [] }
      const updated = { ...prev, [dateKey]: updater(existing) }
      saveState('mydiet_daily', updated)
      return updated
    })
  }, [])

  const setUser = useCallback((u: UserProfile) => {
    setUserState(u)
    saveState('mydiet_user', u)
  }, [])

  const updateWeight = useCallback((w: number) => {
    setUserState(prev => {
      const updated = { ...prev, weight: w, bmi: +(w / ((prev.height / 100) ** 2)).toFixed(1) }
      saveState('mydiet_user', updated)
      return updated
    })
  }, [])

  const toggleMealCheck = useCallback((mealType: 'breakfast' | 'lunch' | 'dinner') => {
    const dateKey = getDateKey(selectedYear, selectedMonth, selectedDate)
    updateDailyRecord(dateKey, (record) => {
      const meal = record.meals[mealType]
      const wasChecked = meal.checked
      const newMeals = { ...record.meals, [mealType]: { ...meal, checked: !wasChecked } }

      const sign = wasChecked ? -1 : 1
      const newNutrition = {
        ...record.nutrition,
        calories: { ...record.nutrition.calories, current: Math.max(0, record.nutrition.calories.current + sign * meal.calories) },
        protein: { ...record.nutrition.protein, current: Math.max(0, record.nutrition.protein.current + sign * meal.protein) },
        carbs: { ...record.nutrition.carbs, current: Math.max(0, record.nutrition.carbs.current + sign * meal.carbs) },
        fats: { ...record.nutrition.fats, current: Math.max(0, record.nutrition.fats.current + sign * meal.fats) },
      }

      return { ...record, nutrition: newNutrition, meals: newMeals }
    })
  }, [selectedYear, selectedMonth, selectedDate, updateDailyRecord])

  const incrementStreak = useCallback(() => {
    if (!streakCheckedToday) {
      setStreak(s => {
        const n = s + 1
        saveState('mydiet_streak', n)
        return n
      })
      setStreakCheckedToday(true)
      saveState('mydiet_streak_today', true)
    }
  }, [streakCheckedToday])

  const completePlan = useCallback(() => {
    setPlanCompleted(true)
    saveState('mydiet_plan_done', true)
  }, [])

  const resetPlan = useCallback(() => {
    setPlanCompleted(false)
    saveState('mydiet_plan_done', false)
  }, [])

  const setUnit = useCallback((u: 'metric' | 'imperial') => {
    setUnitState(u)
    saveState('mydiet_unit', u)
  }, [])

  const setSelectedDate = useCallback((d: number) => {
    setSelectedDateState(d)
  }, [])

  const setFullDate = useCallback((year: number, month: number, day: number) => {
    setSelectedYearState(year)
    setSelectedMonthState(month)
    setSelectedDateState(day)
  }, [])

  // Bug 2: reset to today when navigating back
  const resetToToday = useCallback(() => {
    const n = new Date()
    setSelectedYearState(n.getFullYear())
    setSelectedMonthState(n.getMonth())
    setSelectedDateState(n.getDate())
  }, [])

  const addNutrition = useCallback((cal: number, p: number, c: number, f: number) => {
    const dateKey = getDateKey(selectedYear, selectedMonth, selectedDate)
    updateDailyRecord(dateKey, (record) => ({
      ...record,
      nutrition: {
        ...record.nutrition,
        calories: { ...record.nutrition.calories, current: record.nutrition.calories.current + cal },
        protein: { ...record.nutrition.protein, current: record.nutrition.protein.current + p },
        carbs: { ...record.nutrition.carbs, current: record.nutrition.carbs.current + c },
        fats: { ...record.nutrition.fats, current: record.nutrition.fats.current + f },
      },
    }))
  }, [selectedYear, selectedMonth, selectedDate, updateDailyRecord])

  const swapMeal = useCallback((day: string, mealType: 'breakfast' | 'lunch' | 'dinner') => {
    setPlan(prev => {
      const updated = prev.map(d => {
        if (d.day.toLowerCase() !== day.toLowerCase()) return d
        const alts = d.alternatives[mealType]
        const currentMeal = d.meals[mealType]
        // Exclude current meal so we always pick a different one
        const otherAlts = alts.filter(a => a.id !== currentMeal.id)
        if (otherAlts.length === 0) return d
        const randomAlt = otherAlts[Math.floor(Math.random() * otherAlts.length)]
        return {
          ...d,
          meals: { ...d.meals, [mealType]: { ...randomAlt, checked: false } },
        }
      })
      saveState('mydiet_plan', updated)
      return updated
    })
  }, [])

  // Bug 1: Select a specific alternative to replace current meal
  const selectMealAlternative = useCallback((day: string, mealType: 'breakfast' | 'lunch' | 'dinner', altId: string) => {
    setPlan(prev => {
      const updated = prev.map(d => {
        if (d.day.toLowerCase() !== day.toLowerCase()) return d
        const alt = d.alternatives[mealType].find(a => a.id === altId)
        if (!alt) return d
        return {
          ...d,
          meals: { ...d.meals, [mealType]: { ...alt, checked: false } },
        }
      })
      saveState('mydiet_plan', updated)
      return updated
    })
  }, [])

  // Add extra meals (from Identifier)
  const addExtraMeals = useCallback((meals: ExtraMeal[]) => {
    const n = new Date()
    const dateKey = getDateKey(n.getFullYear(), n.getMonth(), n.getDate())
    updateDailyRecord(dateKey, (record) => ({
      ...record,
      extraMeals: [...(record.extraMeals || []), ...meals],
    }))
  }, [updateDailyRecord])

  // Remove a single extra meal and subtract its nutrition
  const removeExtraMeal = useCallback((mealId: string) => {
    const dateKey = getDateKey(selectedYear, selectedMonth, selectedDate)
    updateDailyRecord(dateKey, (record) => {
      const meal = (record.extraMeals || []).find(m => m.id === mealId)
      if (!meal) return record
      const newExtra = (record.extraMeals || []).filter(m => m.id !== mealId)
      return {
        ...record,
        extraMeals: newExtra,
        nutrition: {
          ...record.nutrition,
          calories: { ...record.nutrition.calories, current: Math.max(0, record.nutrition.calories.current - meal.calories) },
          protein: { ...record.nutrition.protein, current: Math.max(0, record.nutrition.protein.current - meal.protein) },
          carbs: { ...record.nutrition.carbs, current: Math.max(0, record.nutrition.carbs.current - meal.carbs) },
          fats: { ...record.nutrition.fats, current: Math.max(0, record.nutrition.fats.current - meal.fats) },
        },
      }
    })
  }, [selectedYear, selectedMonth, selectedDate, updateDailyRecord])

  // Remove all extra meals for current date and subtract their nutrition
  const removeAllExtraMeals = useCallback(() => {
    const dateKey = getDateKey(selectedYear, selectedMonth, selectedDate)
    updateDailyRecord(dateKey, (record) => {
      const extra = record.extraMeals || []
      if (extra.length === 0) return record
      const totalCal = extra.reduce((s, m) => s + m.calories, 0)
      const totalP = extra.reduce((s, m) => s + m.protein, 0)
      const totalC = extra.reduce((s, m) => s + m.carbs, 0)
      const totalF = extra.reduce((s, m) => s + m.fats, 0)
      return {
        ...record,
        extraMeals: [],
        nutrition: {
          ...record.nutrition,
          calories: { ...record.nutrition.calories, current: Math.max(0, record.nutrition.calories.current - totalCal) },
          protein: { ...record.nutrition.protein, current: Math.max(0, record.nutrition.protein.current - totalP) },
          carbs: { ...record.nutrition.carbs, current: Math.max(0, record.nutrition.carbs.current - totalC) },
          fats: { ...record.nutrition.fats, current: Math.max(0, record.nutrition.fats.current - totalF) },
        },
      }
    })
  }, [selectedYear, selectedMonth, selectedDate, updateDailyRecord])

// --- MODIFIED: Create a new post using REAL logged-in user data ---
  const addPost = useCallback(async (post: Post) => {
    try {
      // 1. Get the actual logged-in user data from storage
      const currentUserData = JSON.parse(localStorage.getItem('user') || '{}');
      const realUserId = currentUserData.id || 1; // Use real ID
      const realUserName = currentUserData.username || 'Anonymous'; // Use real name
      const realAvatar = currentUserData.avatarGradient || 'from-[#3B82F6] to-[#8B5CF6]'; // Default blueish avatar

      // 2. Prepare the data payload
      const postData = {
        userId: realUserId, 
        title: post.title,
        content: post.content,
        imageUrl: post.image,
        tags: JSON.stringify(post.tags),
        nutrition: post.nutrition ? JSON.stringify(post.nutrition) : null
      };

      // 3. Send the POST request
      const response = await fetch('http://localhost:8080/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) throw new Error('Failed to create post');

      const savedPost = await response.json();

      // 4. Map the backend data using REAL user info
      const newFrontendPost: Post = {
        id: String(savedPost.id),
        title: savedPost.title,
        content: savedPost.content,
        image: savedPost.imageUrl || '',
        author: savedPost.authorName || realUserName,
        authorId: `UID-${String(realUserId).padStart(6, '0')}`,                 
        avatarGradient: savedPost.authorAvatarGradient || realAvatar,
        likes: 0,
        liked: false,
        tags: savedPost.tags ? JSON.parse(savedPost.tags) : [],
        comments: [],
        nutrition: savedPost.nutrition ? JSON.parse(savedPost.nutrition) : undefined
      };

      // 5. Update the UI
      setPostsState(prev => [newFrontendPost, ...prev]);
      setTrendingPostsState(prev => [newFrontendPost, ...prev]);

    } catch (error) {
      console.error("Error creating post:", error);
    }
  }, []);

  // --- MODIFIED: Send a new comment using REAL logged-in user data ---
  const addComment = useCallback(async (postId: string, comment: Comment) => {
    try {
      // 1. Get the actual logged-in user data
      const currentUserData = JSON.parse(localStorage.getItem('user') || '{}');
      const realUserId = currentUserData.id || 1;
      const realUserName = currentUserData.username || 'Anonymous';
      const realAvatar = currentUserData.avatarGradient || 'from-[#3B82F6] to-[#8B5CF6]';

      // 2. Send request
      const response = await fetch(`http://localhost:8080/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: comment.text, userId: realUserId }), // ✅ CRITICAL FIX: Use real ID
      });

      if (!response.ok) throw new Error('Failed to add comment');

      const savedComment = await response.json();

      // 3. Construct comment object using REAL user info
      const newFrontendComment: Comment = {
        ...comment,
        id: String(savedComment.id),
        author: savedComment.authorName || realUserName,
        authorId: `UID-${String(realUserId).padStart(6, '0')}`,                    
        avatarGradient: savedComment.authorAvatarGradient || realAvatar,
      };

      // 4. Update UI state
      setPostsState(prev => prev.map(p => {
        if (p.id === postId) {
          return { ...p, comments: [newFrontendComment, ...p.comments] };
        }
        return p;
      }));

      setTrendingPostsState(prev => prev.map(p => {
        if (p.id === postId) {
          return { ...p, comments: [newFrontendComment, ...p.comments] };
        }
        return p;
      }));

    } catch (error) {
      console.error("Error adding comment:", error);
    }
  }, []);

  // Add: Toggle follow status for a user
  const toggleFollow = useCallback((targetUsername: string) => {
    setUserState(prev => {
      const currentList = prev.followingList || []
      const isFollowing = currentList.includes(targetUsername)

      // If already following, remove them; otherwise, add them to the list
      const newList = isFollowing
        ? currentList.filter(name => name !== targetUsername)
        : [...currentList, targetUsername]

      const updated = {
        ...prev,
        followingList: newList,
        following: newList.length // Sync the following count
      }
      saveState('mydiet_user', updated)
      return updated
    })
  }, [])

  // --- MODIFIED: Send a new comment to the Spring Boot backend ---


  // Bug 5: delete own comment
  const deleteCommentRecursive = (comments: Comment[], commentId: string): Comment[] => {
    return comments
      .filter(c => c.id !== commentId)
      .map(c => c.replies ? { ...c, replies: deleteCommentRecursive(c.replies, commentId) } : c)
  }

  const deleteComment = useCallback((postId: string, commentId: string) => {
    setPostsState(prev => {
      const updated = prev.map(p => p.id === postId ? { ...p, comments: deleteCommentRecursive(p.comments, commentId) } : p)
      saveState('mydiet_posts', updated)
      return updated
    })
    setTrendingPostsState(prev => {
      const updated = prev.map(p => p.id === postId ? { ...p, comments: deleteCommentRecursive(p.comments, commentId) } : p)
      saveState('mydiet_tposts', updated)
      return updated
    })
  }, [])

  // Bug 6: nested reply — add reply as a child of the target comment
  const addReplyRecursive = (comments: Comment[], targetId: string, reply: Comment): Comment[] => {
    return comments.map(c => {
      if (c.id === targetId) {
        return { ...c, replies: [...(c.replies || []), reply] }
      }
      if (c.replies && c.replies.length > 0) {
        return { ...c, replies: addReplyRecursive(c.replies, targetId, reply) }
      }
      return c
    })
  }

  const addReplyToComment = useCallback((postId: string, commentId: string, reply: Comment) => {
    setPostsState(prev => {
      const updated = prev.map(p => p.id === postId ? { ...p, comments: addReplyRecursive(p.comments, commentId, reply) } : p)
      saveState('mydiet_posts', updated)
      return updated
    })
    setTrendingPostsState(prev => {
      const updated = prev.map(p => p.id === postId ? { ...p, comments: addReplyRecursive(p.comments, commentId, reply) } : p)
      saveState('mydiet_tposts', updated)
      return updated
    })
  }, [])

  const updatePostComments = useCallback((postId: string, comments: Comment[]) => {
    setPostsState(prev => {
      const updated = prev.map(p => p.id === postId ? { ...p, comments } : p)
      saveState('mydiet_posts', updated)
      return updated
    })
    setTrendingPostsState(prev => {
      const updated = prev.map(p => p.id === postId ? { ...p, comments } : p)
      saveState('mydiet_tposts', updated)
      return updated
    })
  }, [])

// --- MODIFIED: Post Like ---
  const togglePostLike = useCallback(async (postId: string) => {
    let isNowLiked = false;
    const myDbId = localStorage.getItem('mydiet_user_db_id');
    if (!myDbId) return; // 未登录不能点赞

    // 1. Optimistic UI Update (视觉上先亮起红心，保证流畅度)
    const updater = (p: Post) => {
      if (p.id !== postId) return p;
      isNowLiked = !p.liked; 
      return { ...p, liked: isNowLiked, likes: isNowLiked ? p.likes + 1 : p.likes - 1 };
    };

    setPostsState(prev => prev.map(updater));
    setTrendingPostsState(prev => prev.map(updater));

    // 2. 告诉后端去数据库里更新 post_likes 表 (注意这里加上了 userId)
    try {
      await fetch(`http://localhost:8080/api/posts/${postId}/like?userId=${myDbId}&isLike=${isNowLiked}`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error("Error updating like:", error);
    }
  }, []);


  // --- MODIFIED: Comment Like ---
  const toggleCommentLike = useCallback(async (postId: string, commentId: string) => {
    const myDbId = localStorage.getItem('mydiet_user_db_id');
    if (!myDbId) return;

    let isNowLiked = false;

    // 1. Optimistic UI Update
    const updater = (p: Post) => {
      if (p.id !== postId) return p;
      return {
        ...p,
        comments: p.comments.map(c => {
          if (c.id === commentId) {
            isNowLiked = !c.liked;
            return {
              ...c,
              liked: isNowLiked,
              likes: isNowLiked ? c.likes + 1 : c.likes - 1
            };
          }
          return c;
        })
      };
    };

    setPostsState(prev => prev.map(updater));
    setTrendingPostsState(prev => prev.map(updater));

    // 2. 告诉后端去更新数据库
    try {
      await fetch(`http://localhost:8080/api/posts/comments/${commentId}/like?userId=${myDbId}&isLike=${isNowLiked}`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error("Error updating comment like:", error);
    }
  }, []);

  // Bug 4: Refresh — shuffle posts order
  const refreshPosts = useCallback(() => {
    const shuffle = <T,>(arr: T[]): T[] => {
      const a = [...arr]
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
      }
      return a
    }
    setPostsState(prev => {
      const shuffled = shuffle(prev)
      saveState('mydiet_posts', shuffled)
      return shuffled
    })
    setTrendingPostsState(prev => {
      const shuffled = shuffle(prev)
      saveState('mydiet_tposts', shuffled)
      return shuffled
    })
  }, [])

  // Sign in — validate saved account and start a session
  const signIn = useCallback(async (email: string, password: string, remember = false): Promise<AuthResult> => {
  try {
    const normalizedEmail = email.trim().toLowerCase()

    const response = await fetch('http://localhost:8080/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: normalizedEmail,
        password
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, message: data.message || 'Login failed' }
    }

    // ... inside signIn function ...
    if (remember) {
      localStorage.setItem('user', JSON.stringify(data))
      localStorage.setItem('mydiet_remembered_email', normalizedEmail)
      sessionStorage.removeItem('user')
    } else {
      sessionStorage.setItem('user', JSON.stringify(data))
      localStorage.removeItem('user')
      localStorage.removeItem('mydiet_remembered_email')
    }

    // CRITICAL FIX: Store the raw database ID for future API calls (like creating posts)
    localStorage.setItem('mydiet_user_db_id', data.id)

    setUserState(prev => {
    // Format the database ID to a 6-digit string
    const formattedId = `UID-${String(data.id).padStart(6, '0')}`;
    const updated = {
      ...prev,
      name: data.username || prev.name,
      uid: formattedId // Update the profile UID to the formatted one
    }
    saveState('mydiet_user', updated)
    return updated
  })

    setIsLoggedIn(true)

    return { success: true }
  } catch (error) {
    return { success: false, message: 'Server error' }
  }
  }, [])

// Sign up — create account if email does not already exist
  const signUp = useCallback(async (name: string, email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: name,
          email: email.trim().toLowerCase(),
          password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, message: data.message || 'Signup failed' }
      }

      localStorage.setItem('user', JSON.stringify(data))
      localStorage.setItem('mydiet_logged_in', 'true')
      
      localStorage.setItem('mydiet_user_db_id', data.id)

      const formattedId = `UID-${String(data.id).padStart(6, '0')}`;

      setUserState(prev => {
        const updated = {
          ...prev,
          name: data.username || prev.name,
          uid: formattedId 
        }
        // Save the updated profile state to local storage so it persists on refresh
        saveState('mydiet_user', updated) 
        return updated
      })

      setIsLoggedIn(true)

      return { success: true }

    } catch (error) {
      return { success: false, message: 'Server error' }
    }
  }, [])

// Sign out — clear session and wipe identity to fetch fresh data for the next user
  const signOut = useCallback(() => {
    // 1. Clear basic user auth info
    localStorage.removeItem('user')
    sessionStorage.removeItem('user')
    localStorage.removeItem('mydiet_remembered_email')
    
    // 2. Clear legacy local posts cache (good for cleanup)
    localStorage.removeItem('mydiet_posts')
    localStorage.removeItem('mydiet_tposts')
    
    localStorage.removeItem('mydiet_user_db_id')

    // 3. Update state, which will trigger useEffect to fetch guest data
    setIsLoggedIn(false)
  }, [])

  return (
    <AppContext.Provider value={{
      user, nutrition: currentRecord.nutrition, streak, streakCheckedToday,
      meals: currentRecord.meals, weeklyPlan: plan,
      planCompleted, unit, selectedDate, selectedMonth, selectedYear, isToday, isLoggedIn,
      posts, trendingPostsList,
      extraMeals: currentRecord.extraMeals || [],
      setUser, updateWeight, toggleMealCheck, incrementStreak,
      completePlan, resetPlan, setUnit, setSelectedDate, setFullDate, resetToToday,
      addNutrition, swapMeal, selectMealAlternative, addExtraMeals, removeExtraMeal, removeAllExtraMeals,
      addPost,
      toggleFollow,
      addComment, deleteComment, addReplyToComment, updatePostComments, refreshPosts, togglePostLike,
      toggleCommentLike,
      signIn, signUp, signOut,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
