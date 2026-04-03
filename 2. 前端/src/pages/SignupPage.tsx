import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Leaf, User, Mail, Lock, EyeOff, Eye, Clock, Shield, CreditCard } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function SignupPage() {
  const navigate = useNavigate()
  const { signUp } = useApp()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!firstName.trim()) errs.firstName = 'First name is required'
    if (!lastName.trim()) errs.lastName = 'Last name is required'
    if (!email.trim()) errs.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(email.trim().toLowerCase())) errs.email = 'Please enter a valid email address'
    if (!password) errs.password = 'Password is required'
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters'
    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password'
    else if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match'
    if (!agreeTerms) errs.terms = 'You must agree to the terms'
    return errs
  }

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    const result = signUp(`${firstName} ${lastName}`, email.trim().toLowerCase(), password)
    if (!result.success) {
      setErrors({ email: result.message || 'Unable to create account' })
      return
    }

    navigate('/plan', { replace: true })
  }

  const inputClass = (field: string) =>
    `flex h-[42px] items-center gap-2.5 rounded-xl border bg-white/5 px-3.5 transition ${
      errors[field] ? 'border-[#F87171]/50' : 'border-white/10 focus-within:border-[#4ADE80]/40'
    }`

  return (
    <div className="relative flex min-h-screen w-full" style={{ background: 'linear-gradient(135deg, #0F0C29 0%, #302B63 50%, #24243E 100%)' }}>
      {/* Background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-[100px] -top-[80px] h-[450px] w-[450px] rounded-full opacity-50" style={{ background: 'radial-gradient(circle, rgba(74,222,128,0.09) 0%, transparent 70%)' }} />
        <div className="absolute right-[-50px] bottom-[-100px] h-[380px] w-[380px] rounded-full opacity-40" style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.09) 0%, transparent 70%)' }} />
        <div className="absolute left-[500px] top-[250px] h-[300px] w-[300px] rounded-full opacity-30" style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 flex min-h-screen w-full flex-col">
        {/* ==================== Signup Nav ==================== */}
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

        {/* ==================== Signup Body ==================== */}
        <div className="flex flex-1">
          {/* Left Side — Branding */}
          <div className="flex flex-1 flex-col justify-center px-20 py-16">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="mb-5 text-[52px] font-bold leading-[1.1] text-white" style={{ letterSpacing: '-1.5px' }}>
                Start Your<br />Health Journey
              </h1>
              <p className="mb-10 max-w-[380px] text-[16px] leading-relaxed text-white/40">
                Create your free account and get personalized meal plans powered by AI, tailored to your unique goals.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Clock, color: '#4ADE80', bgColor: '#4ADE8018', text: 'Set up in under 2 minutes' },
                  { icon: Shield, color: '#22D3EE', bgColor: '#22D3EE18', text: 'Your data is private & secure' },
                  { icon: CreditCard, color: '#818CF8', bgColor: '#818CF818', text: 'No credit card required' },
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

          {/* Right Side — Signup Card */}
          <div className="flex w-[520px] shrink-0 items-center justify-center px-16 py-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
              className="w-full rounded-3xl border border-white/8 bg-white/5 p-9 backdrop-blur-3xl">

              {/* Header */}
              <div className="mb-5">
                <h2 className="text-[28px] font-bold text-white">Create Account</h2>
                <p className="mt-2 text-[14px] text-white/40">Fill in your details to get started</p>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateAccount} className="space-y-3.5">
                {/* Name Row */}
                <div className="flex gap-3">
                  <div className="min-w-0 flex-1">
                    <label className="mb-1.5 block text-[13px] font-medium text-white/80">First Name</label>
                    <div className={inputClass('firstName')}>
                      <User className="h-4 w-4 shrink-0 text-white/28" />
                      <input type="text" value={firstName}
                        onChange={e => { setFirstName(e.target.value); setErrors(er => { const n = { ...er }; delete n.firstName; return n }) }}
                        placeholder="John"
                        className="min-w-0 flex-1 bg-transparent text-[13px] text-white placeholder-white/28 outline-none" />
                    </div>
                    {errors.firstName && <p className="mt-1 text-[11px] text-[#F87171]">{errors.firstName}</p>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <label className="mb-1.5 block text-[13px] font-medium text-white/80">Last Name</label>
                    <div className={inputClass('lastName')}>
                      <input type="text" value={lastName}
                        onChange={e => { setLastName(e.target.value); setErrors(er => { const n = { ...er }; delete n.lastName; return n }) }}
                        placeholder="Doe"
                        className="min-w-0 flex-1 bg-transparent text-[13px] text-white placeholder-white/28 outline-none" />
                    </div>
                    {errors.lastName && <p className="mt-1 text-[11px] text-[#F87171]">{errors.lastName}</p>}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-white/80">Email</label>
                  <div className={inputClass('email')}>
                    <Mail className="h-4 w-4 shrink-0 text-white/28" />
                    <input type="email" value={email}
                      onChange={e => { setEmail(e.target.value); setErrors(er => { const n = { ...er }; delete n.email; return n }) }}
                      placeholder="name@example.com"
                      className="flex-1 bg-transparent text-[13px] text-white placeholder-white/28 outline-none" />
                  </div>
                  {errors.email && <p className="mt-1 text-[11px] text-[#F87171]">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-white/80">Password</label>
                  <div className={inputClass('password')}>
                    <Lock className="h-4 w-4 shrink-0 text-white/28" />
                    <input type={showPassword ? 'text' : 'password'} value={password}
                      onChange={e => { setPassword(e.target.value); setErrors(er => { const n = { ...er }; delete n.password; return n }) }}
                      placeholder="Create a strong password"
                      className="flex-1 bg-transparent text-[13px] text-white placeholder-white/28 outline-none" />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="text-white/20 transition hover:text-white/50">
                      {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-[11px] text-[#F87171]">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-white/80">Confirm Password</label>
                  <div className={inputClass('confirmPassword')}>
                    <Lock className="h-4 w-4 shrink-0 text-white/28" />
                    <input type="password" value={confirmPassword}
                      onChange={e => { setConfirmPassword(e.target.value); setErrors(er => { const n = { ...er }; delete n.confirmPassword; return n }) }}
                      placeholder="Confirm your password"
                      className="flex-1 bg-transparent text-[13px] text-white placeholder-white/28 outline-none" />
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-[11px] text-[#F87171]">{errors.confirmPassword}</p>}
                </div>

                {/* Terms */}
                <div className="flex items-start gap-2">
                  <button type="button" onClick={() => { setAgreeTerms(v => !v); setErrors(er => { const n = { ...er }; delete n.terms; return n }) }}
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${agreeTerms ? 'border-[#4ADE80] bg-[#4ADE80]/15' : 'border-white/15 bg-white/5'}`}>
                    {agreeTerms && <div className="h-1.5 w-1.5 rounded-sm bg-[#4ADE80]" />}
                  </button>
                  <span className={`text-[12px] leading-relaxed ${errors.terms ? 'text-[#F87171]/80' : 'text-white/48'}`}>
                    I agree to the Terms of Service and Privacy Policy
                  </span>
                </div>

                {/* Create Account Button */}
                <button type="submit"
                  className="flex h-[46px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#4ADE80] to-[#22D3EE] text-[15px] font-semibold text-white transition-transform hover:scale-[1.02]">
                  Create Account
                </button>
              </form>

              {/* Divider */}
              <div className="my-5 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/8" />
                <span className="text-[12px] text-white/28">or sign up with</span>
                <div className="h-px flex-1 bg-white/8" />
              </div>

              {/* Social Buttons */}
              <div className="flex gap-3">
                <button className="flex h-[42px] flex-1 items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10">
                  <span className="text-[16px] font-bold text-white">G</span>
                  <span className="text-[14px] font-medium text-white/80">Google</span>
                </button>
                <button className="flex h-[42px] flex-1 items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10">
                  <span className="text-[18px] font-bold text-white"></span>
                  <span className="text-[14px] font-medium text-white/80">Apple</span>
                </button>
              </div>

              {/* Sign In Link */}
              <p className="mt-5 text-center text-[13px] text-white/40">
                Already have an account?{' '}
                <button onClick={() => navigate('/login')} className="font-semibold text-[#4ADE80] transition hover:text-[#4ADE80]/80">Sign In</button>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
