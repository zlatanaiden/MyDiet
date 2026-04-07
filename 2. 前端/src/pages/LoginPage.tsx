import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Leaf, Mail, Lock, EyeOff, Eye, Camera, Target, Users } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn, planCompleted } = useApp()
  const [email, setEmail] = useState(() => localStorage.getItem('mydiet_remembered_email') || '')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})

const handleSignIn = async (e: React.FormEvent) => {
  e.preventDefault()

  const newErrors: { email?: string; password?: string; general?: string } = {}
  const normalizedEmail = email.trim().toLowerCase()

  if (!normalizedEmail) newErrors.email = 'Email is required'
  else if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) newErrors.email = 'Please enter a valid email address'
  if (!password) newErrors.password = 'Password is required'

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors)
    return
  }

  const result = await signIn(normalizedEmail, password, remember)

  if (!result.success) {
    setErrors({ general: result.message || 'Unable to sign in' })
    return
  }

  if (planCompleted) navigate('/', { replace: true })
  else navigate('/plan', { replace: true })
}

  return (
    <div className="relative flex min-h-screen w-full" style={{ background: 'linear-gradient(135deg, #0F0C29 0%, #302B63 50%, #24243E 100%)' }}>
      {/* Background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-[100px] -top-[80px] h-[450px] w-[450px] rounded-full opacity-50" style={{ background: 'radial-gradient(circle, rgba(74,222,128,0.09) 0%, transparent 70%)' }} />
        <div className="absolute right-[-50px] bottom-[-100px] h-[380px] w-[380px] rounded-full opacity-40" style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.09) 0%, transparent 70%)' }} />
        <div className="absolute left-[500px] top-[300px] h-[300px] w-[300px] rounded-full opacity-30" style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 flex min-h-screen w-full flex-col">
        {/* ==================== Login Nav ==================== */}
        <nav className="flex h-[72px] items-center justify-between border-b border-white/10 px-12 backdrop-blur-[20px]" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2.5">
            <Leaf className="h-7 w-7 text-[#4ADE80]" />
            <span className="text-[22px] font-bold tracking-tight text-white" style={{ letterSpacing: '-0.5px' }}>MyDiet</span>
          </div>
          <button onClick={() => navigate('/landing')}
            className="text-[14px] font-medium text-white/70 transition hover:text-white">
            Back to Landing Page
          </button>
        </nav>

        {/* ==================== Login Body ==================== */}
        <div className="flex flex-1">
          {/* Left Side — Branding */}
          <div className="flex flex-1 flex-col justify-center px-20 py-16">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="mb-5 text-[52px] font-bold leading-[1.1] text-white" style={{ letterSpacing: '-1.5px' }}>
                Welcome<br />Back
              </h1>
              <p className="mb-10 max-w-[380px] text-[16px] leading-relaxed text-white/40">
                Track your meals, monitor your nutrition, and achieve your health goals with AI-powered insights.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Camera, color: '#4ADE80', bgColor: '#4ADE8018', text: 'AI-powered food recognition' },
                  { icon: Target, color: '#22D3EE', bgColor: '#22D3EE18', text: 'Personalized nutrition goals' },
                  { icon: Users, color: '#818CF8', bgColor: '#818CF818', text: 'Active community & challenges' },
                ].map((feature) => (
                  <div key={feature.text} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: feature.bgColor }}>
                      <feature.icon className="h-4 w-4" style={{ color: feature.color }} />
                    </div>
                    <span className="text-[14px] text-white/60">{feature.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Side — Login Card */}
          <div className="flex w-[520px] shrink-0 items-center justify-center px-16 py-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
              className="w-full rounded-3xl border border-white/8 bg-white/5 p-9 backdrop-blur-3xl">

              {/* Header */}
              <div className="mb-6">
                <h2 className="text-[28px] font-bold text-white">Sign In</h2>
                <p className="mt-2 text-[14px] text-white/40">Enter your credentials to access your account</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSignIn} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="mb-2 block text-[13px] font-medium text-white/80">Email</label>
                  <div className={`flex h-11 items-center gap-2.5 rounded-xl border bg-white/5 px-3.5 transition ${errors.email ? 'border-[#F87171]/50' : 'border-white/10 focus-within:border-[#4ADE80]/40'}`}>
                    <Mail className="h-[18px] w-[18px] shrink-0 text-white/28" />
                    <input type="email" value={email}
                      onChange={e => { setEmail(e.target.value); setErrors(er => ({ ...er, email: undefined, general: undefined })) }}
                      placeholder="name@example.com"
                      className="flex-1 bg-transparent text-[14px] text-white placeholder-white/28 outline-none" />
                  </div>
                  {errors.email && <p className="mt-1 text-[12px] text-[#F87171]">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-[13px] font-medium text-white/80">Password</label>
                    <button type="button" className="text-[12px] font-medium text-[#4ADE80] transition hover:text-[#4ADE80]/80">Forgot password?</button>
                  </div>
                  <div className={`flex h-11 items-center gap-2.5 rounded-xl border bg-white/5 px-3.5 transition ${errors.password ? 'border-[#F87171]/50' : 'border-white/10 focus-within:border-[#4ADE80]/40'}`}>
                    <Lock className="h-[18px] w-[18px] shrink-0 text-white/28" />
                    <input type={showPassword ? 'text' : 'password'} value={password}
                      onChange={e => { setPassword(e.target.value); setErrors(er => ({ ...er, password: undefined, general: undefined })) }}
                      placeholder="••••••••"
                      className="flex-1 bg-transparent text-[14px] text-white placeholder-white/28 outline-none" />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="text-white/20 transition hover:text-white/50">
                      {showPassword ? <Eye className="h-[18px] w-[18px]" /> : <EyeOff className="h-[18px] w-[18px]" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-[12px] text-[#F87171]">{errors.password}</p>}
                </div>

                {errors.general && <p className="text-[12px] text-[#F87171]">{errors.general}</p>}

                {/* Remember me */}
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setRemember(v => !v)}
                    className={`flex h-[18px] w-[18px] items-center justify-center rounded border transition ${remember ? 'border-[#4ADE80] bg-[#4ADE80]/15' : 'border-white/15 bg-white/5'}`}>
                    {remember && <div className="h-2 w-2 rounded-sm bg-[#4ADE80]" />}
                  </button>
                  <span className="text-[13px] text-white/55">Remember me</span>
                </div>

                {/* Sign In Button */}
                <button type="submit"
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#4ADE80] to-[#22D3EE] text-[15px] font-semibold text-white transition-transform hover:scale-[1.02]">
                  Sign In
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/8" />
                <span className="text-[12px] text-white/28">or continue with</span>
                <div className="h-px flex-1 bg-white/8" />
              </div>

              {/* Social Buttons */}
              <div className="flex gap-3">
                <button className="flex h-11 flex-1 items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10">
                  <span className="text-[16px] font-bold text-white">G</span>
                  <span className="text-[14px] font-medium text-white/80">Google</span>
                </button>
                <button className="flex h-11 flex-1 items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10">
                  <span className="text-[18px] font-bold text-white"></span>
                  <span className="text-[14px] font-medium text-white/80">Apple</span>
                </button>
              </div>

              {/* Sign Up Link */}
              <p className="mt-6 text-center text-[13px] text-white/40">
                Don&apos;t have an account?{' '}
                <button onClick={() => navigate('/signup')} className="font-semibold text-[#4ADE80] transition hover:text-[#4ADE80]/80">Sign Up</button>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
