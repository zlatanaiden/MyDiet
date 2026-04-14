import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Pencil, RotateCcw, X, Check, Activity, RefreshCw } from 'lucide-react'
import { useApp } from '../context/AppContext'

// ==================== Week Date Helpers ====================
function getWeekDates(): Date[] {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0=Sun, 1=Mon, ...
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function formatShortDate(d: Date): string {
  return `${d.getMonth() + 1}.${d.getDate()}`
}

// ==================== Questionnaire (2-1) ====================
function PlanQuestionnaire() {
  const { setUser, user, generatePlan, planLoading } = useApp()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    goal: (user.goal || 'lose') as string,
    targetWeight: user.targetWeight || 0,
    age: user.age || 0,
    gender: user.gender || '',
    height: user.height || 0,
    weight: user.weight || 0,
    activity: user.activityLevel || '',
    allergies: (user.allergies || []).join(', '),
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!form.age || form.age <= 0) newErrors.age = 'Age is required'
    if (!form.gender) newErrors.gender = 'Gender is required'
    if (!form.height || form.height <= 0) newErrors.height = 'Height is required'
    if (!form.weight || form.weight <= 0) newErrors.weight = 'Weight is required'
    if (!form.activity) newErrors.activity = 'Activity Level is required'
    if (form.goal !== 'maintain' && (!form.targetWeight || form.targetWeight <= 0)) {
      newErrors.targetWeight = 'Target Weight is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const [submitError, setSubmitError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitError('')

    const bmi = +(form.weight / ((form.height / 100) ** 2)).toFixed(1)
    const allergies = form.allergies.split(',').map(s => s.trim()).filter(Boolean)

    // Map frontend activity labels to backend activityLevel keys
    const activityMap: Record<string, string> = {
      'Sedentary': 'sedentary',
      'Light': 'light',
      'Moderate': 'moderate',
      'Active': 'active',
      'Very Active': 'veryActive',
    }

    try {
      await generatePlan({
        age: form.age,
        gender: form.gender === 'Other' ? 'Male' : form.gender,
        weightKg: form.weight,
        heightCm: form.height,
        activityLevel: activityMap[form.activity] || 'moderate',
        goal: form.goal,
        allergies,
      })

      setUser({
        ...user,
        goal: form.goal as 'lose' | 'gain' | 'maintain',
        targetWeight: form.targetWeight,
        age: form.age,
        gender: form.gender,
        height: form.height,
        weight: form.weight,
        activityLevel: form.activity,
        allergies: form.allergies.split(',').map(s => s.trim()).filter(Boolean),
        restrictions: [],
        bmi,
      })

      navigate('/plan')
    } catch (err) {
      setSubmitError('Failed to generate plan. Is the backend running?')
      console.error(err)
    }
  }

  const ringClass = (field: string) =>
    errors[field]
      ? 'ring-1 ring-[#F87171]/60 focus:ring-[#F87171]'
      : 'ring-1 ring-white/10 focus:ring-[#4ADE80]/50'

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-[28px] font-bold text-white">Personalize Your Plan</h1>
      <p className="mb-8 text-[14px] text-white/50">Tell us about yourself so we can create the perfect meal plan.</p>

      <form onSubmit={handleSubmit} className="glass space-y-6 rounded-2xl p-8">
        {/* Goal */}
        <div>
          <label className="mb-3 block text-[13px] font-semibold uppercase tracking-wider text-white/60">Your Goal</label>
          <div className="flex gap-3">
            {(['lose', 'gain', 'maintain'] as const).map((g) => (
              <button key={g} type="button" onClick={() => { setForm(f => ({ ...f, goal: g })); setErrors(e => { const n = { ...e }; delete n.targetWeight; return n }) }}
                className={`flex-1 rounded-xl py-3 text-[14px] font-semibold capitalize transition-all ${
                  form.goal === g ? 'bg-[#4ADE80]/20 text-[#4ADE80] ring-1 ring-[#4ADE80]/40' : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}>
                {g === 'lose' ? 'Fat Loss' : g === 'gain' ? 'Gain Weight' : 'Maintain'}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {form.goal !== 'maintain' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
              <label className="mb-2 block text-[13px] font-semibold uppercase tracking-wider text-white/60">Target Weight (kg)</label>
              <input type="number" value={form.targetWeight || ''} onChange={e => { setForm(f => ({ ...f, targetWeight: +e.target.value })); setErrors(er => { const n = { ...er }; delete n.targetWeight; return n }) }}
                placeholder="e.g. 65"
                className={`w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition ${ringClass('targetWeight')}`} />
              {errors.targetWeight && <p className="mt-1 text-[12px] text-[#F87171]">{errors.targetWeight}</p>}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-[13px] font-semibold uppercase tracking-wider text-white/60">Age</label>
            <input type="number" value={form.age || ''} onChange={e => { setForm(f => ({ ...f, age: +e.target.value })); setErrors(er => { const n = { ...er }; delete n.age; return n }) }}
              placeholder="e.g. 25"
              className={`w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition ${ringClass('age')}`} />
            {errors.age && <p className="mt-1 text-[12px] text-[#F87171]">{errors.age}</p>}
          </div>
          <div>
            <label className="mb-2 block text-[13px] font-semibold uppercase tracking-wider text-white/60">Height (cm)</label>
            <input type="number" value={form.height || ''} onChange={e => { setForm(f => ({ ...f, height: +e.target.value })); setErrors(er => { const n = { ...er }; delete n.height; return n }) }}
              placeholder="e.g. 175"
              className={`w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition ${ringClass('height')}`} />
            {errors.height && <p className="mt-1 text-[12px] text-[#F87171]">{errors.height}</p>}
          </div>
          <div>
            <label className="mb-2 block text-[13px] font-semibold uppercase tracking-wider text-white/60">Weight (kg)</label>
            <input type="number" value={form.weight || ''} onChange={e => { setForm(f => ({ ...f, weight: +e.target.value })); setErrors(er => { const n = { ...er }; delete n.weight; return n }) }}
              placeholder="e.g. 70"
              className={`w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition ${ringClass('weight')}`} />
            {errors.weight && <p className="mt-1 text-[12px] text-[#F87171]">{errors.weight}</p>}
          </div>
          <div>
            <label className="mb-2 block text-[13px] font-semibold uppercase tracking-wider text-white/60">Gender</label>
            <select value={form.gender} onChange={e => { setForm(f => ({ ...f, gender: e.target.value })); setErrors(er => { const n = { ...er }; delete n.gender; return n }) }}
              className={`w-full rounded-xl bg-white/5 px-4 py-3 text-white outline-none transition ${ringClass('gender')}`}>
              <option value="" disabled className="bg-[#1a1a2e] text-white/50">Select gender</option>
              <option value="Male" className="bg-[#1a1a2e] text-white">Male</option>
              <option value="Female" className="bg-[#1a1a2e] text-white">Female</option>
              <option value="Other" className="bg-[#1a1a2e] text-white">Other</option>
            </select>
            {errors.gender && <p className="mt-1 text-[12px] text-[#F87171]">{errors.gender}</p>}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-semibold uppercase tracking-wider text-white/60">Activity Level</label>
          <select value={form.activity} onChange={e => { setForm(f => ({ ...f, activity: e.target.value })); setErrors(er => { const n = { ...er }; delete n.activity; return n }) }}
            className={`w-full rounded-xl bg-white/5 px-4 py-3 text-white outline-none transition ${ringClass('activity')}`}>
            <option value="" disabled className="bg-[#1a1a2e] text-white/50">Select activity level</option>
            {['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active'].map(a => (
              <option key={a} value={a} className="bg-[#1a1a2e] text-white">{a}</option>
            ))}
          </select>
          {errors.activity && <p className="mt-1 text-[12px] text-[#F87171]">{errors.activity}</p>}
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-semibold uppercase tracking-wider text-white/60">Allergies (comma separated)</label>
          <input value={form.allergies} onChange={e => setForm(f => ({ ...f, allergies: e.target.value }))}
            placeholder="e.g. Peanuts, Shellfish"
            className="w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none ring-1 ring-white/10 transition focus:ring-[#4ADE80]/50" />
        </div>
        <button type="submit" disabled={planLoading}
          className="w-full rounded-xl bg-gradient-to-r from-[#4ADE80] to-[#22D3EE] py-4 text-[16px] font-bold text-white transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed">
          {planLoading ? 'Generating...' : 'Generate My Plan'}
        </button>
        {submitError && <p className="mt-2 text-center text-[13px] text-[#F87171]">{submitError}</p>}
      </form>
    </div>
  )
}

// ==================== Edit Modal Wrapper ====================
function EditModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-8" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="relative z-10 w-full max-w-md rounded-2xl bg-[#1a1a2e] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-[18px] font-bold text-white">{title}</h3>
          <button onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/40 transition hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  )
}

// ==================== Dashboard (2-2) ====================
function PlanDashboard() {
  const { user, setUser, updateWeight, weeklyPlan, resetPlan, generatePlan, planLoading } = useApp()
  const navigate = useNavigate()
  const weekDates = getWeekDates()

  const [regenError, setRegenError] = useState('')

  // Bug 4: Edit modal states
  const [editStats, setEditStats] = useState(false)
  const [editGoal, setEditGoal] = useState(false)
  const [editRestrictions, setEditRestrictions] = useState(false)

  // Temp forms for editing
  const [statsForm, setStatsForm] = useState({ height: user.height, weight: user.weight })
  const [goalForm, setGoalForm] = useState({ goal: user.goal as string, targetWeight: user.targetWeight })
  const [restrictionsForm, setRestrictionsForm] = useState({
    allergies: user.allergies.join(', '),
  })

  const saveStats = () => {
    const bmi = +(statsForm.weight / ((statsForm.height / 100) ** 2)).toFixed(1)
    setUser({ ...user, height: statsForm.height, weight: statsForm.weight, bmi })
    setEditStats(false)
  }

  const saveGoal = () => {
    setUser({ ...user, goal: goalForm.goal as 'lose' | 'gain' | 'maintain', targetWeight: goalForm.targetWeight })
    setEditGoal(false)
  }

  const saveRestrictions = () => {
    setUser({
      ...user,
      allergies: restrictionsForm.allergies.split(',').map(s => s.trim()).filter(Boolean),
      restrictions: [],
    })
    setEditRestrictions(false)
  }

  return (
    <div className="flex gap-6">
      {/* Left Sidebar */}
      <div className="w-[280px] shrink-0 space-y-4">
        {/* User Stats */}
        <div className="glass space-y-4 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-white">My Stats</h3>
            <button onClick={() => { setStatsForm({ height: user.height, weight: user.weight }); setEditStats(true) }}
              className="flex items-center gap-1 rounded-lg bg-[#4ADE80]/10 px-2 py-1 text-[11px] font-medium text-[#4ADE80] transition-all duration-200 hover:scale-110 hover:bg-[#4ADE80]/20 hover:shadow-[0_0_12px_rgba(74,222,128,0.3)]">
              <Pencil className="h-3 w-3" /> Update
            </button>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Height', value: `${user.height} cm` },
              { label: 'Weight', value: `${user.weight} kg` },
              { label: 'BMI', value: `${user.bmi}`, color: user.bmi < 25 ? '#4ADE80' : '#F97316' },
            ].map((s) => (
              <div key={s.label} className="flex justify-between text-[13px]">
                <span className="text-white/50">{s.label}</span>
                <span className="font-semibold" style={s.color ? { color: s.color } : undefined}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Goal */}
        <div className="glass space-y-3 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-white">Current Goal</h3>
            <button onClick={() => { setGoalForm({ goal: user.goal, targetWeight: user.targetWeight }); setEditGoal(true) }}
              className="flex items-center gap-1 rounded-lg bg-[#4ADE80]/10 px-2 py-1 text-[11px] font-medium text-[#4ADE80] transition-all duration-200 hover:scale-110 hover:bg-[#4ADE80]/20 hover:shadow-[0_0_12px_rgba(74,222,128,0.3)]">
              <Pencil className="h-3 w-3" /> Update
            </button>
          </div>
          <div className="rounded-xl bg-[#4ADE80]/10 px-4 py-3 text-center">
            <p className="text-[14px] font-semibold text-[#4ADE80] capitalize">
              {user.goal === 'lose' ? 'Fat Loss' : user.goal === 'gain' ? 'Gain Weight' : 'Maintain'}
            </p>
            {user.goal !== 'maintain' && (
              <p className="text-[12px] text-white/50">Target: {user.targetWeight} kg</p>
            )}
          </div>
        </div>

        {/* Allergies */}
        <div className="glass space-y-3 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-white">Allergies</h3>
            <button onClick={() => {
              setRestrictionsForm({ allergies: user.allergies.join(', ') })
              setEditRestrictions(true)
            }}
              className="flex items-center gap-1 rounded-lg bg-[#4ADE80]/10 px-2 py-1 text-[11px] font-medium text-[#4ADE80] transition-all duration-200 hover:scale-110 hover:bg-[#4ADE80]/20 hover:shadow-[0_0_12px_rgba(74,222,128,0.3)]">
              <Pencil className="h-3 w-3" /> Update
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.allergies.length > 0
              ? user.allergies.map(tag => (
                <span key={tag} className="rounded-full bg-white/5 px-3 py-1 text-[12px] text-white/60">{tag}</span>
              ))
              : <span className="text-[12px] text-white/30">No allergies set</span>
            }
          </div>
        </div>

        {/* Activity Level */}
        <div className="glass space-y-3 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-white">Activity Level</h3>
            <Activity className="h-4 w-4 text-[#22D3EE]" />
          </div>
          <div className="space-y-2">
            <div className="flex gap-1">
              {(['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active'] as const).map((level, i) => {
                const levels = ['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active']
                const currentIdx = levels.indexOf(user.activityLevel)
                const isActive = i <= currentIdx
                return (
                  <button key={level}
                    onClick={() => setUser({ ...user, activityLevel: level })}
                    className="group relative flex-1"
                    title={level}>
                    <div className={`h-3 rounded-full transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#4ADE80] to-[#22D3EE] shadow-[0_0_8px_rgba(74,222,128,0.3)]'
                        : 'bg-white/10 hover:bg-white/15'
                    }`} />
                    <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#1a1a2e] px-2 py-1 text-[10px] text-white/70 opacity-0 shadow-lg transition group-hover:opacity-100">
                      {level}
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="flex justify-between text-[10px] text-white/30">
              <span>Sedentary</span>
              <span>Very Active</span>
            </div>
            <p className="text-center text-[14px] font-semibold text-[#4ADE80]">{user.activityLevel || 'Not set'}</p>
          </div>
        </div>

        {/* Regenerate & Edit Settings */}
        <button
          disabled={planLoading}
          onClick={async () => {
            setRegenError('')
            const activityMap: Record<string, string> = {
              'Sedentary': 'sedentary', 'Light': 'light', 'Moderate': 'moderate',
              'Active': 'active', 'Very Active': 'veryActive',
            }
            try {
              await generatePlan({
                age: user.age,
                gender: user.gender === 'Other' ? 'Male' : user.gender,
                weightKg: user.weight,
                heightCm: user.height,
                activityLevel: activityMap[user.activityLevel] || 'moderate',
                goal: user.goal || 'maintain',
                allergies: [...(user.allergies || [])],
              })
            } catch { setRegenError('Failed to regenerate. Is backend running?') }
          }}
          className="glass group flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-[13px] font-semibold text-[#4ADE80] transition-all duration-200 hover:scale-[1.03] hover:bg-white/10 hover:shadow-[0_0_16px_rgba(74,222,128,0.2)] disabled:opacity-50 disabled:cursor-not-allowed">
          <RefreshCw className={`h-4 w-4 transition-transform duration-300 ${planLoading ? 'animate-spin' : 'group-hover:-rotate-180'}`} />
          {planLoading ? 'Generating...' : 'Regenerate Plan'}
        </button>
        {regenError && <p className="text-center text-[12px] text-[#F87171]">{regenError}</p>}
        <button onClick={() => resetPlan()}
          className="glass group flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-[13px] font-semibold text-[#F97316] transition-all duration-200 hover:scale-[1.03] hover:bg-white/10 hover:shadow-[0_0_16px_rgba(249,115,22,0.2)]">
          <RotateCcw className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-180" /> Edit Settings & Regenerate
        </button>
      </div>

      {/* Main Area */}
      <div className="flex-1 space-y-5">
        <h2 className="text-[20px] font-bold text-white">
          Weekly Meal Plan{' '}
          <span className="text-[14px] font-normal text-white/40">
            ({formatShortDate(weekDates[0])} - {formatShortDate(weekDates[6])})
          </span>
        </h2>

        <motion.div className="space-y-4"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {weeklyPlan.map((day, index) => (
            <div key={day.day} className="glass cursor-pointer rounded-2xl p-5 transition-all hover:bg-white/10"
              onClick={() => navigate(`/plan/day/${day.day.toLowerCase()}`)}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[16px] font-bold text-white">
                  {day.day}{' '}
                  <span className="text-[13px] font-normal text-white/40">
                    {formatShortDate(weekDates[index])}
                  </span>
                </h3>
                <ChevronRight className="h-4 w-4 text-white/40" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {(['breakfast', 'lunch', 'dinner'] as const).map((mt) => {
                  const meal = day.meals[mt]
                  return (
                    <div key={mt} className="rounded-xl bg-white/5 p-3">
                      <img src={meal.image} alt={meal.name} className="mb-2 h-24 w-full rounded-lg object-cover" />
                      <p className="truncate text-[12px] font-medium text-white">{meal.name}</p>
                      <p className="text-[11px] text-white/40">{meal.calories} kcal</p>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ==================== Edit Modals ==================== */}
      <AnimatePresence>
        {/* Edit Stats Modal */}
        {editStats && (
          <EditModal title="Update Stats" onClose={() => setEditStats(false)}>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wider text-white/50">Height (cm)</label>
                <input type="number" value={statsForm.height || ''} onChange={e => setStatsForm(f => ({ ...f, height: +e.target.value }))}
                  className="w-full rounded-xl bg-white/5 px-4 py-3 text-white outline-none ring-1 ring-white/10 transition focus:ring-[#4ADE80]/50" />
              </div>
              <div>
                <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wider text-white/50">Weight (kg)</label>
                <input type="number" value={statsForm.weight || ''} onChange={e => setStatsForm(f => ({ ...f, weight: +e.target.value }))}
                  className="w-full rounded-xl bg-white/5 px-4 py-3 text-white outline-none ring-1 ring-white/10 transition focus:ring-[#4ADE80]/50" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditStats(false)}
                  className="flex-1 rounded-xl border border-white/15 bg-white/5 py-3 text-[14px] font-semibold text-white/70 transition hover:bg-white/10">
                  Cancel
                </button>
                <button onClick={saveStats}
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#4ADE80] to-[#22D3EE] py-3 text-[14px] font-semibold text-white transition hover:scale-[1.02]">
                  Save
                </button>
              </div>
            </div>
          </EditModal>
        )}

        {/* Edit Goal Modal */}
        {editGoal && (
          <EditModal title="Update Goal" onClose={() => setEditGoal(false)}>
            <div className="space-y-4">
              <div>
                <label className="mb-3 block text-[12px] font-semibold uppercase tracking-wider text-white/50">Goal</label>
                <div className="flex gap-2">
                  {(['lose', 'gain', 'maintain'] as const).map((g) => (
                    <button key={g} type="button" onClick={() => setGoalForm(f => ({ ...f, goal: g }))}
                      className={`flex-1 rounded-xl py-2.5 text-[13px] font-semibold capitalize transition-all ${
                        goalForm.goal === g ? 'bg-[#4ADE80]/20 text-[#4ADE80] ring-1 ring-[#4ADE80]/40' : 'bg-white/5 text-white/50 hover:bg-white/10'
                      }`}>
                      {g === 'lose' ? 'Fat Loss' : g === 'gain' ? 'Gain Weight' : 'Maintain'}
                    </button>
                  ))}
                </div>
              </div>
              {goalForm.goal !== 'maintain' && (
                <div>
                  <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wider text-white/50">Target Weight (kg)</label>
                  <input type="number" value={goalForm.targetWeight || ''} onChange={e => setGoalForm(f => ({ ...f, targetWeight: +e.target.value }))}
                    className="w-full rounded-xl bg-white/5 px-4 py-3 text-white outline-none ring-1 ring-white/10 transition focus:ring-[#4ADE80]/50" />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditGoal(false)}
                  className="flex-1 rounded-xl border border-white/15 bg-white/5 py-3 text-[14px] font-semibold text-white/70 transition hover:bg-white/10">
                  Cancel
                </button>
                <button onClick={saveGoal}
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#4ADE80] to-[#22D3EE] py-3 text-[14px] font-semibold text-white transition hover:scale-[1.02]">
                  Save
                </button>
              </div>
            </div>
          </EditModal>
        )}

        {/* Edit Restrictions Modal */}
        {editRestrictions && (
          <EditModal title="Update Allergies" onClose={() => setEditRestrictions(false)}>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wider text-white/50">Allergies (comma separated)</label>
                <input value={restrictionsForm.allergies} onChange={e => setRestrictionsForm(f => ({ ...f, allergies: e.target.value }))}
                  placeholder="e.g. Peanuts, Shellfish"
                  className="w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none ring-1 ring-white/10 transition focus:ring-[#4ADE80]/50" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditRestrictions(false)}
                  className="flex-1 rounded-xl border border-white/15 bg-white/5 py-3 text-[14px] font-semibold text-white/70 transition hover:bg-white/10">
                  Cancel
                </button>
                <button onClick={saveRestrictions}
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#4ADE80] to-[#22D3EE] py-3 text-[14px] font-semibold text-white transition hover:scale-[1.02]">
                  Save
                </button>
              </div>
            </div>
          </EditModal>
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== Plan Page (Router) ====================
export default function PlanPage() {
  const { planCompleted } = useApp()
  return planCompleted ? <PlanDashboard /> : <PlanQuestionnaire />
}
