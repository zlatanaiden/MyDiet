import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, RefreshCw, ChevronDown, ChevronUp, X, Clock, Tag, Info } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { Meal, Alternative } from '../data/mockData'

// Get this week's dates (Mon-Sun)
function getWeekDates(): Date[] {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function PlanDayDetail() {
  const { day } = useParams<{ day: string }>()
  const navigate = useNavigate()
  const { weeklyPlan, swapMeal, selectMealAlternative } = useApp()
  const [detailRecipe, setDetailRecipe] = useState<Meal | Alternative | null>(null)

  const dayPlan = weeklyPlan.find(d => d.day.toLowerCase() === day?.toLowerCase())
  if (!dayPlan) return <div className="text-white/50">Day not found</div>

  // Compute the date for this day of the week
  const weekDates = getWeekDates()
  const dayIndex = dayNames.findIndex(d => d.toLowerCase() === day?.toLowerCase())
  const dayDate = dayIndex >= 0 ? weekDates[dayIndex] : null
  const dateLabel = dayDate ? `${dayDate.getMonth() + 1}.${dayDate.getDate()}` : ''

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/plan')}
          className="glass flex h-10 w-10 items-center justify-center rounded-xl text-white/60 transition hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-[24px] font-bold text-white">
            {dayPlan.day} Detail{' '}
            {dateLabel && <span className="text-[16px] font-normal text-white/40">({dateLabel})</span>}
          </h1>
          <p className="text-[14px] text-white/50">View and customize your meals</p>
        </div>
      </div>

      {/* Meal Cards */}
      {(['breakfast', 'lunch', 'dinner'] as const).map((mealType) => (
        <MealDetailCard key={mealType} dayPlan={dayPlan} mealType={mealType}
          onSwap={() => swapMeal(dayPlan.day, mealType)}
          onSelectAlt={(altId) => selectMealAlternative(dayPlan.day, mealType, altId)}
          onShowDetail={(recipe) => setDetailRecipe(recipe)} />
      ))}

      {/* Recipe Detail Modal */}
      <AnimatePresence>
        {detailRecipe && (
          <RecipeDetailModal recipe={detailRecipe} onClose={() => setDetailRecipe(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---------- helpers ---------- */

/** Parse ISO 8601 duration like "PT24H45M" or "PT30M" to human-readable string */
function formatDuration(iso?: string | null): string {
  if (!iso) return ''
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!m) return iso
  const h = m[1] ? `${m[1]}h ` : ''
  const min = m[2] ? `${m[2]}m` : ''
  return (h + min).trim() || iso
}

/* ---------- RecipeDetailModal ---------- */

function RecipeDetailModal({ recipe, onClose }: { recipe: Meal | Alternative; onClose: () => void }) {
  const ingredients = recipe.ingredients ?? []
  const quantities = recipe.quantities ?? []
  const instructions = recipe.instructions ?? []
  const keywords = recipe.keywords ?? []

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="relative mx-4 max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[#1a1a2e] p-0 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero image */}
        <div className="relative h-56 w-full">
          <img src={recipe.image} alt={recipe.name} className="h-full w-full rounded-t-2xl object-cover" />
          <div className="absolute inset-0 rounded-t-2xl bg-gradient-to-t from-[#1a1a2e] via-transparent to-transparent" />
          <button onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white/80 transition hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 pb-6">
          {/* Title + badges */}
          <div className="-mt-6 relative">
            <h2 className="text-[22px] font-bold text-white">{recipe.name}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {recipe.category && (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/15 px-3 py-1 text-[12px] font-medium text-purple-300">
                  <Tag className="h-3 w-3" /> {recipe.category}
                </span>
              )}
              {recipe.totalTime && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-3 py-1 text-[12px] font-medium text-blue-300">
                  <Clock className="h-3 w-3" /> {formatDuration(recipe.totalTime)}
                </span>
              )}
            </div>
          </div>

          {/* Keywords */}
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {keywords.map((kw, i) => (
                <span key={i} className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-white/50">
                  {kw}
                </span>
              ))}
            </div>
          )}

          {/* Nutrition grid */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Calories', value: `${recipe.calories}`, unit: 'kcal', color: '#4ADE80' },
              { label: 'Protein', value: `${recipe.protein}`, unit: 'g', color: '#4ADE80' },
              { label: 'Carbs', value: `${recipe.carbs}`, unit: 'g', color: '#22D3EE' },
              { label: 'Fats', value: `${recipe.fats}`, unit: 'g', color: '#F97316' },
            ].map((n) => (
              <div key={n.label} className="rounded-xl bg-white/5 p-3 text-center">
                <p className="text-[18px] font-bold" style={{ color: n.color }}>{n.value}</p>
                <p className="text-[10px] text-white/40">{n.unit}</p>
                <p className="text-[11px] text-white/50">{n.label}</p>
              </div>
            ))}
          </div>

          {/* Ingredients */}
          {ingredients.length > 0 && (
            <div>
              <h3 className="mb-2 text-[15px] font-semibold text-white">Ingredients</h3>
              <div className="rounded-xl bg-white/5 divide-y divide-white/5">
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Ingredient</span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Qty</span>
                </div>
                {ingredients.map((ing, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2">
                    <span className="text-[13px] text-white/80">{ing}</span>
                    <span className="text-[13px] font-medium text-white/60">{quantities[i] ?? ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          {instructions.length > 0 && (
            <div>
              <h3 className="mb-2 text-[15px] font-semibold text-white">Instructions</h3>
              <ol className="space-y-2">
                {instructions.map((step, i) => (
                  <li key={i} className="flex gap-3 rounded-xl bg-white/5 p-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#4ADE80]/15 text-[12px] font-bold text-[#4ADE80]">
                      {i + 1}
                    </span>
                    <span className="text-[13px] leading-relaxed text-white/70">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ---------- MealDetailCard ---------- */

function MealDetailCard({ dayPlan, mealType, onSwap, onSelectAlt, onShowDetail }: {
  dayPlan: ReturnType<typeof useApp>['weeklyPlan'][0]
  mealType: 'breakfast' | 'lunch' | 'dinner'
  onSwap: () => void
  onSelectAlt: (altId: string) => void
  onShowDetail: (recipe: Meal | Alternative) => void
}) {
  const [showAlts, setShowAlts] = useState(false)
  const meal = dayPlan.meals[mealType]
  const alternatives = dayPlan.alternatives[mealType]
  const label = mealType.charAt(0).toUpperCase() + mealType.slice(1)

  return (
    <div className="glass overflow-hidden rounded-2xl">
      {/* Main meal */}
      <div className="flex gap-6 p-6">
        <img src={meal.image} alt={meal.name}
          className="h-48 w-64 rounded-xl object-cover" />
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-white/40">{label}</p>
            <h3 className="mb-3 text-[20px] font-bold text-white">
              {meal.name}
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Calories', value: `${meal.calories}`, unit: 'kcal', color: '#4ADE80' },
                { label: 'Protein', value: `${meal.protein}`, unit: 'g', color: '#4ADE80' },
                { label: 'Carbs', value: `${meal.carbs}`, unit: 'g', color: '#22D3EE' },
                { label: 'Fats', value: `${meal.fats}`, unit: 'g', color: '#F97316' },
              ].map((n) => (
                <div key={n.label} className="rounded-xl bg-white/5 p-3 text-center">
                  <p className="text-[18px] font-bold" style={{ color: n.color }}>{n.value}</p>
                  <p className="text-[10px] text-white/40">{n.unit}</p>
                  <p className="text-[11px] text-white/50">{n.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <motion.button onClick={onSwap} whileTap={{ rotate: 180 }}
              className="glass flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-medium text-white/70 transition hover:text-white">
              <RefreshCw className="h-4 w-4" /> Swap
            </motion.button>
            <button onClick={() => setShowAlts(!showAlts)}
              className="glass flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-medium text-white/70 transition hover:text-white">
              Alternatives {showAlts ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            <button onClick={() => onShowDetail(meal)}
              className="glass flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-medium text-white/70 transition hover:text-white">
              <Info className="h-4 w-4" /> Recipe Details
            </button>
          </div>
        </div>
      </div>

      {/* Alternatives */}
      <AnimatePresence>
        {showAlts && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="border-t border-white/5">
            <div className="grid grid-cols-3 gap-4 p-6">
              {alternatives.map((alt) => (
                <div key={alt.id} className="group rounded-xl bg-white/5 p-3 transition hover:bg-white/10">
                  <img src={alt.image} alt={alt.name}
                    className="mb-2 h-28 w-full rounded-lg object-cover" />
                  <p className="truncate text-[13px] font-semibold text-white">
                    {alt.name}
                  </p>
                  <p className="mb-2 text-[11px] text-white/40">{alt.calories} kcal · P:{alt.protein}g · C:{alt.carbs}g · F:{alt.fats}g</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onSelectAlt(alt.id)}
                      className="flex-1 rounded-lg bg-[#4ADE80]/10 py-1.5 text-[12px] font-semibold text-[#4ADE80] transition hover:bg-[#4ADE80]/20">
                      Select
                    </button>
                    <button
                      onClick={() => onShowDetail(alt)}
                      className="rounded-lg bg-white/5 px-2.5 py-1.5 text-[12px] text-white/50 transition hover:bg-white/10 hover:text-white/70">
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
