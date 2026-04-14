import { useState, useCallback, useLayoutEffect, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion'
import { Check, Flame, Camera, Search, Utensils, X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useApp } from '../context/AppContext'

// Check if (y,m,d) is within ±3 days of (cy,cm,cd)
function isDateInStrip(y: number, m: number, d: number, cy: number, cm: number, cd: number): boolean {
  const a = new Date(y, m, d).getTime()
  const b = new Date(cy, cm, cd).getTime()
  const diffDays = (a - b) / (24 * 60 * 60 * 1000)
  return diffDays >= -3 && diffDays <= 3
}

// ==================== Calendar Strip ====================
function CalendarStrip() {
  const { selectedDate, selectedMonth, selectedYear, setFullDate } = useApp()
  const [expanded, setExpanded] = useState(false)
  const today = new Date()

  // Strip window center: only move when selected date is outside the 7-day window
  const [stripCenter, setStripCenter] = useState(() => ({
    y: today.getFullYear(),
    m: today.getMonth(),
    d: today.getDate(),
  }))

  useEffect(() => {
    if (!isDateInStrip(selectedYear, selectedMonth, selectedDate, stripCenter.y, stripCenter.m, stripCenter.d)) {
      setStripCenter({ y: selectedYear, m: selectedMonth, d: selectedDate })
    }
  }, [selectedYear, selectedMonth, selectedDate, stripCenter.y, stripCenter.m, stripCenter.d])

  // View month/year for navigating in expanded calendar
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [viewYear, setViewYear] = useState(today.getFullYear())

  // 7-day strip centered on stripCenter (stays fixed when selecting nearby dates)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(stripCenter.y, stripCenter.m, stripCenter.d)
    d.setDate(d.getDate() - 3 + i)
    return {
      year: d.getFullYear(),
      month: d.getMonth(),
      date: d.getDate(),
      day: d.toLocaleDateString('en', { weekday: 'short' }),
      isToday: d.toDateString() === today.toDateString(),
    }
  })

  const isSelected = (y: number, m: number, d: number) =>
    selectedYear === y && selectedMonth === m && selectedDate === d

  // Always-visible year/month label based on strip (so it doesn't jump when selecting 2.11)
  const stripMonthLabel = new Date(stripCenter.y, stripCenter.m).toLocaleDateString('en', { month: 'long', year: 'numeric' })

  // Generate month grid for expanded calendar
  const getMonthGrid = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startOffset = firstDay.getDay() // 0=Sun
    const totalDays = lastDay.getDate()
    const grid: (number | null)[] = []
    for (let i = 0; i < startOffset; i++) grid.push(null)
    for (let i = 1; i <= totalDays; i++) grid.push(i)
    return grid
  }

  const monthGrid = getMonthGrid(viewYear, viewMonth)
  const expandedMonthLabel = new Date(viewYear, viewMonth).toLocaleDateString('en', { month: 'long', year: 'numeric' })

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const handleExpand = () => {
    if (!expanded) {
      setViewMonth(selectedMonth)
      setViewYear(selectedYear)
    }
    setExpanded(!expanded)
  }

  return (
    <div className="glass rounded-2xl p-2">
      {/* Always-visible year/month */}
      <div className="px-3 pb-1 pt-1 text-center text-[13px] font-medium text-white/50">
        {stripMonthLabel}
      </div>

      {/* 7-day strip (fixed window; only slides when selected date is outside) */}
      <div className="flex items-center gap-2">
        {days.map((d) => (
          <button key={`${d.year}-${d.month}-${d.date}`}
            onClick={() => setFullDate(d.year, d.month, d.date)}
            className={`flex flex-1 flex-col items-center gap-1 rounded-xl px-3 py-3 transition-all ${
              isSelected(d.year, d.month, d.date)
                ? 'bg-[#4ADE80]/20 text-[#4ADE80] shadow-lg shadow-[#4ADE80]/10'
                : 'text-white/50 hover:bg-white/5'
            }`}>
            <span className="text-[11px] font-medium uppercase">{d.day}</span>
            <span className="text-[18px] font-bold">{d.date}</span>
            {d.isToday && <div className="h-1 w-1 rounded-full bg-[#4ADE80]" />}
          </button>
        ))}
      </div>

      {/* Expand / Collapse toggle */}
      <button onClick={handleExpand}
        className="mx-auto mt-2 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-[12px] text-white/40 transition hover:bg-white/5 hover:text-white/60">
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {expanded ? 'Collapse' : 'View Full Calendar'}
      </button>

      {/* Expanded full month calendar */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden">

            {/* Month & Year navigation */}
            <div className="flex items-center justify-between px-4 py-3">
              <button onClick={prevMonth}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-[15px] font-semibold text-white">{expandedMonthLabel}</span>
              <button onClick={nextMonth}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 px-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(wd => (
                <div key={wd} className="py-1 text-center text-[11px] font-medium text-white/40">{wd}</div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-1 px-2 pb-2">
              {monthGrid.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} />
                const isSel = isSelected(viewYear, viewMonth, day)
                const isTod = viewYear === today.getFullYear() && viewMonth === today.getMonth() && day === today.getDate()
                return (
                  <button key={i}
                    onClick={() => { setFullDate(viewYear, viewMonth, day); setExpanded(false) }}
                    className={`rounded-lg py-2 text-[14px] transition-all ${
                      isSel
                        ? 'bg-[#4ADE80]/20 font-bold text-[#4ADE80]'
                        : isTod
                          ? 'font-semibold text-[#4ADE80]'
                          : 'text-white/60 hover:bg-white/5'
                    }`}>
                    {day}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== Progress Ring ====================
function ProgressRing() {
  const { nutrition } = useApp()
  const r = 80, circ = 2 * Math.PI * r

  const calPct = nutrition.calories.target > 0 ? nutrition.calories.current / nutrition.calories.target : 0
  const calOverflow = calPct > 1

  // Bug 4: Use a motion value so the ring animates smoothly FROM previous position
  const strokeOffset = useMotionValue(circ)
  const prevPctRef = useRef(0)

  useEffect(() => {
    const clampedPct = Math.min(calPct, 1)
    // Animate from the previous value to the new value (not from 0)
    const from = circ * (1 - prevPctRef.current)
    const to = circ * (1 - clampedPct)
    strokeOffset.set(from)
    animate(strokeOffset, to, { duration: 1.2, ease: 'easeOut' })
    prevPctRef.current = clampedPct
  }, [calPct, circ, strokeOffset])

  // Bug 5: Ring color — red when overflow
  const ringColor = calOverflow ? '#F87171' : '#4ADE80'

  return (
    <div className="glass flex flex-col items-center gap-6 rounded-2xl p-8 lg:flex-row lg:gap-12">
      <div className="relative">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
          <motion.circle cx="100" cy="100" r={r} fill="none"
            stroke={ringColor} strokeWidth="12"
            strokeLinecap="round" strokeDasharray={circ}
            style={{ strokeDashoffset: strokeOffset }}
            transform="rotate(-90 100 100)" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-[32px] font-bold ${calOverflow ? 'text-[#F87171]' : 'text-white'}`}>
            {nutrition.calories.current}
          </span>
          <span className="text-[13px] text-white/50">/ {nutrition.calories.target} kcal</span>
        </div>
      </div>

      {/* Linear bars */}
      <div className="flex flex-1 flex-col gap-5 w-full">
        {[
          { label: 'Protein', ...nutrition.protein },
          { label: 'Carbs', ...nutrition.carbs },
          { label: 'Fats', ...nutrition.fats },
        ].map((item) => {
          const pct = item.target > 0 ? item.current / item.target : 0
          const overflow = pct > 1
          const barColor = overflow ? '#F87171' : item.color

          return (
            <div key={item.label} className="space-y-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-white/70">{item.label}</span>
                <span className={overflow ? 'font-semibold text-[#F87171]' : 'text-white/50'}>
                  {item.current}g / {item.target}g
                  {overflow && ' ⚠'}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                <motion.div className="h-full rounded-full"
                  style={{ backgroundColor: barColor }}
                  animate={{ width: `${Math.min(pct * 100, 100)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ==================== Meal Card ====================
function MealCard({ mealType, label }: { mealType: 'breakfast' | 'lunch' | 'dinner'; label: string }) {
  const { meals, toggleMealCheck, isToday } = useApp()
  const meal = meals[mealType]

  const handleCheck = useCallback(() => {
    if (!isToday) return
    if (!meal.checked) {
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 }, colors: ['#4ADE80', '#22D3EE', '#FBBF24'] })
    }
    toggleMealCheck(mealType)
  }, [meal.checked, mealType, toggleMealCheck, isToday])

  return (
    <motion.div className="glass group flex items-center gap-4 rounded-2xl p-4 transition-all hover:bg-white/10"
      layout whileHover={{ scale: 1.01 }}>
      <img src={meal.image} alt={meal.name}
        className="h-[72px] w-[72px] rounded-xl object-cover" />
      <div className="flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">{label}</p>
        <p className="text-[15px] font-semibold text-white">{meal.name}</p>
        <p className="text-[12px] text-white/50">{meal.calories} kcal</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden gap-2 text-[11px] text-white/40 sm:flex">
          <span>P:{meal.protein}g</span>
          <span>C:{meal.carbs}g</span>
          <span>F:{meal.fats}g</span>
        </div>
        <button onClick={handleCheck}
          disabled={!isToday}
          className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all ${
            meal.checked
              ? 'border-[#4ADE80] bg-[#4ADE80]/20 text-[#4ADE80]'
              : isToday
                ? 'border-white/20 text-white/30 hover:border-[#4ADE80]/50'
                : 'border-white/10 text-white/15 cursor-not-allowed'
          }`}>
          <Check className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}

// ==================== Streak Badge ====================
function StreakBadge() {
  const { streak, streakCheckedToday, incrementStreak } = useApp()
  const [animating, setAnimating] = useState(false)

  const handleClick = () => {
    if (!streakCheckedToday) {
      setAnimating(true)
      incrementStreak()
      confetti({ particleCount: 30, spread: 40, origin: { y: 0.6 }, colors: ['#F97316', '#FBBF24', '#F472B6'] })
      setTimeout(() => setAnimating(false), 600)
    }
  }

  return (
    <button onClick={handleClick}
      className="glass flex items-center gap-2.5 rounded-full px-4 py-2 transition-all hover:bg-white/10">
      <motion.div animate={animating ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.6 }}>
        <Flame className={`h-5 w-5 ${streakCheckedToday ? 'fill-[#F97316] text-[#F97316]' : 'text-[#F97316]'}`} />
      </motion.div>
      <span className="text-[13px] font-semibold text-[#F97316]">{streak} Days Streak</span>
    </button>
  )
}

// ==================== Floating Toolbar ====================
function FloatingToolbar() {
  const navigate = useNavigate()
  return (
    <div className="fixed right-4 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-3">
      <button onClick={() => navigate('/identifier')}
        className="glass flex h-12 w-12 items-center justify-center rounded-2xl text-white/60 transition-all hover:bg-white/15 hover:text-white">
        <Camera className="h-5 w-5" />
      </button>
      <button onClick={() => navigate('/community')}
        className="glass flex h-12 w-12 items-center justify-center rounded-2xl text-white/60 transition-all hover:bg-white/15 hover:text-white">
        <Search className="h-5 w-5" />
      </button>
    </div>
  )
}

// ==================== Homepage ====================
export default function Homepage() {
  const { user, resetToToday, isToday, selectedDate, selectedMonth, selectedYear, extraMeals, removeExtraMeal, removeAllExtraMeals } = useApp()

  // useLayoutEffect — synchronous before paint, no flash
  useLayoutEffect(() => {
    resetToToday()
  }, [resetToToday])

  const today = new Date()
  const formatDate = (m: number, d: number) => `${m + 1}.${d}`
  const selectedLabel = formatDate(selectedMonth, selectedDate)
  const todayLabel = formatDate(today.getMonth(), today.getDate())

  // ---------- Console log removed — plan now generated by backend ----------

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Greeting + Streak */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-bold text-white">Morning, {user.name}!</h1>
          <p className="text-[14px] text-white/50">Let&apos;s track your nutrition today</p>
        </div>
        <StreakBadge />
      </div>

      {/* Calendar */}
      <CalendarStrip />

      {/* Non-today hint */}
      {!isToday && (
        <div className="rounded-xl bg-[#F97316]/10 px-4 py-2 text-center text-[13px] text-[#F97316]">
          Viewing data for {selectedLabel} — meal check-in is only available today ({todayLabel})
        </div>
      )}

      {/* Progress */}
      <ProgressRing />

      {/* Meals */}
      <div className="space-y-3">
        <h2 className="text-[18px] font-bold text-white">{isToday ? "Today's" : selectedLabel} Meals</h2>
        <AnimatePresence>
          <MealCard mealType="breakfast" label="Breakfast" />
          <MealCard mealType="lunch" label="Lunch" />
          <MealCard mealType="dinner" label="Dinner" />
        </AnimatePresence>
      </div>

      {/* Extra Meals — from Identifier */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="h-4 w-4 text-[#22D3EE]" />
            <h2 className="text-[18px] font-bold text-white">Extra Meals</h2>
            {extraMeals.length > 0 && (
              <span className="ml-1 rounded-full bg-[#22D3EE]/15 px-2 py-0.5 text-[11px] font-semibold text-[#22D3EE]">
                {extraMeals.length}
              </span>
            )}
          </div>
          {extraMeals.length > 0 && (
            <button onClick={() => removeAllExtraMeals()}
              className="rounded-lg border border-red-400/40 bg-red-400/10 px-3 py-1.5 text-[12px] font-medium text-red-400 transition hover:bg-red-400/20">
              Delete All
            </button>
          )}
        </div>
        {extraMeals.length > 0 ? (
          extraMeals.map((meal) => (
            <motion.div key={meal.id}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="glass flex items-center gap-4 rounded-2xl p-4">
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-xl bg-gradient-to-br from-[#22D3EE]/20 to-[#4ADE80]/20">
                <Utensils className="h-7 w-7 text-[#22D3EE]" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-medium uppercase tracking-wider text-[#22D3EE]/60">Identified Food</p>
                <p className="text-[15px] font-semibold text-white">{meal.name}</p>
                <p className="text-[12px] text-white/50">{meal.calories} kcal</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden gap-2 text-[11px] text-white/40 sm:flex">
                  <span>P:{meal.protein}g</span>
                  <span>C:{meal.carbs}g</span>
                  <span>F:{meal.fats}g</span>
                </div>
                <button onClick={() => removeExtraMeal(meal.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/30 transition hover:border-red-400/50 hover:text-red-400">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-[13px] text-white/30">No extra meals yet — use the Identifier to add food</p>
        )}
      </div>

      <FloatingToolbar />
    </div>
  )
}
