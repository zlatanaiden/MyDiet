import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CloudUpload, Pencil, Check, X } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useApp } from '../context/AppContext'
import { identifierFoods } from '../data/mockData'

interface FoodItem {
  name: string; weight: string; calories: number; confidence: number; editing?: boolean
}

export default function Identifier() {
  const navigate = useNavigate()
  const { addNutrition, addExtraMeals } = useApp()
  const [image, setImage] = useState<string | null>(null)
  const [foods, setFoods] = useState<FoodItem[]>([])
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const processImage = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      setImage(reader.result as string)
      // Simulate AI processing
      setTimeout(() => setFoods(identifierFoods.map(f => ({ ...f, editing: false }))), 800)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) processImage(file)
  }, [processImage])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processImage(file)
  }, [processImage])

  const handleConfirm = () => {
    const totalCal = foods.reduce((s, f) => s + f.calories, 0)
    const totalP = Math.round(totalCal * 0.3 / 4)
    const totalC = Math.round(totalCal * 0.45 / 4)
    const totalF = Math.round(totalCal * 0.25 / 9)
    addNutrition(totalCal, totalP, totalC, totalF)

    // Bug 3: also add foods to Extra Meals on Homepage
    const extras = foods.map((f, i) => ({
      id: `extra-${Date.now()}-${i}`,
      name: f.name,
      calories: f.calories,
      protein: Math.round(f.calories * 0.3 / 4),
      carbs: Math.round(f.calories * 0.45 / 4),
      fats: Math.round(f.calories * 0.25 / 9),
    }))
    addExtraMeals(extras)

    confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 }, colors: ['#4ADE80', '#22D3EE', '#FBBF24'] })
    setTimeout(() => navigate('/'), 1200)
  }

  const updateFood = (idx: number, updates: Partial<FoodItem>) => {
    setFoods(prev => prev.map((f, i) => i === idx ? { ...f, ...updates } : f))
  }

  // ==================== Upload State (3-1) ====================
  if (!image) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-[28px] font-bold text-white">Food Identifier</h1>
          <p className="text-[14px] text-white/50">Upload a photo to identify food and log nutrition</p>
        </div>

        <div onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`glass flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed py-24 transition-all ${
            dragOver ? 'border-[#4ADE80] bg-[#4ADE80]/5' : 'border-white/15 hover:border-white/30'
          }`}>
          <CloudUpload className={`mb-4 h-16 w-16 ${dragOver ? 'text-[#4ADE80]' : 'text-white/30'}`} />
          <p className="mb-1 text-[16px] font-semibold text-white/70">Drag & drop food photo here</p>
          <p className="text-[13px] text-white/40">or click to upload</p>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
        </div>

        {/* Sample button */}
        <button onClick={() => {
          setImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop')
          setTimeout(() => setFoods(identifierFoods.map(f => ({ ...f, editing: false }))), 800)
        }}
          className="glass mx-auto flex items-center gap-2 rounded-xl px-6 py-3 text-[13px] font-medium text-white/60 transition hover:text-white">
          Try with sample image
        </button>
      </div>
    )
  }

  // ==================== Result State (3-2) ====================
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-[24px] font-bold text-white">Recognition Results</h1>

      <div className="flex gap-6">
        {/* Left: Image */}
        <div className="flex-1">
          <div className="glass overflow-hidden rounded-2xl">
            <img src={image} alt="Uploaded food" className="h-[400px] w-full object-cover" />
          </div>
          <button onClick={() => { setImage(null); setFoods([]) }}
            className="mt-3 text-[13px] text-white/40 transition hover:text-white">
            Upload a different photo
          </button>
        </div>

        {/* Right: Results */}
        <div className="flex-1 space-y-4">
          <div className="glass rounded-2xl p-6">
            <h3 className="mb-4 text-[16px] font-bold text-white">Detected Foods</h3>
            <AnimatePresence>
              {foods.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center gap-3 py-8">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#4ADE80] border-t-transparent" />
                  <span className="text-[14px] text-white/50">Analyzing image...</span>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {foods.map((food, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center justify-between rounded-xl bg-white/5 p-4">
                      <div className="flex-1">
                        {food.editing ? (
                          <input autoFocus value={food.name}
                            onChange={e => updateFood(idx, { name: e.target.value })}
                            onBlur={() => updateFood(idx, { editing: false })}
                            onKeyDown={e => e.key === 'Enter' && updateFood(idx, { editing: false })}
                            className="w-full bg-transparent text-[14px] font-semibold text-white outline-none" />
                        ) : (
                          <p className="text-[14px] font-semibold text-white">{food.name}</p>
                        )}
                        <p className="text-[12px] text-white/40">{food.weight} · {food.confidence}% confidence</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[15px] font-bold text-[#4ADE80]">{food.calories} kcal</span>
                        <button onClick={() => updateFood(idx, { editing: !food.editing })}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-white/40 transition hover:text-white">
                          {food.editing ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                        </button>
                        <button onClick={() => setFoods(prev => prev.filter((_, i) => i !== idx))}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-white/40 transition hover:text-red-400">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>

            {foods.length > 0 && (
              <>
                {/* Total */}
                <div className="mt-4 flex justify-between border-t border-white/10 pt-4">
                  <span className="text-[14px] font-semibold text-white">Total</span>
                  <span className="text-[16px] font-bold text-[#4ADE80]">
                    {foods.reduce((s, f) => s + f.calories, 0)} kcal
                  </span>
                </div>

                {/* Bug 6: Cancel + Confirm Buttons */}
                <div className="mt-6 flex gap-3">
                  <button onClick={() => { setImage(null); setFoods([]) }}
                    className="flex-1 rounded-xl border border-white/15 bg-white/5 py-4 text-[15px] font-bold text-white/70 transition hover:bg-white/10">
                    Cancel
                  </button>
                  <button onClick={handleConfirm}
                    className="flex-1 rounded-xl bg-gradient-to-r from-[#4ADE80] to-[#22D3EE] py-4 text-[15px] font-bold text-white transition-transform hover:scale-[1.02]">
                    Confirm & Log Today
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
