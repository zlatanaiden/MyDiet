import { useNavigate } from 'react-router-dom'
import { Leaf, ArrowRight, Sparkles, SlidersHorizontal, Camera, Users, Star, Crown, Check } from 'lucide-react'
import { motion } from 'framer-motion'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }
const stagger = { visible: { transition: { staggerChildren: 0.12 } } }

export default function LandingPage() {
  const navigate = useNavigate()
  const goLogin = () => navigate('/login')

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #0F0C29 0%, #302B63 50%, #24243E 100%)' }}>
      {/* Background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-[120px] -top-[100px] h-[500px] w-[500px] rounded-full opacity-50" style={{ background: 'radial-gradient(circle, rgba(74,222,128,0.09) 0%, transparent 70%)' }} />
        <div className="absolute right-[-50px] top-[600px] h-[400px] w-[400px] rounded-full opacity-40" style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.09) 0%, transparent 70%)' }} />
        <div className="absolute left-[600px] top-[1600px] h-[350px] w-[350px] rounded-full opacity-35" style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)' }} />
        <div className="absolute -left-[80px] top-[2400px] h-[450px] w-[450px] rounded-full opacity-40" style={{ background: 'radial-gradient(circle, rgba(74,222,128,0.08) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px]">
        {/* ==================== Nav Bar ==================== */}
        <nav className="sticky top-0 z-50 flex h-[72px] items-center justify-between border-b border-white/10 px-12 backdrop-blur-[20px]" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <Leaf className="h-7 w-7 text-[#4ADE80]" />
              <span className="text-[22px] font-bold tracking-tight text-white">MyDiet</span>
            </div>
            <div className="flex items-center gap-2">
              {['Features', 'How It Works', 'Pricing', 'Testimonials'].map((label) => (
                <button key={label} onClick={() => document.getElementById(label.toLowerCase().replace(/ /g, '-'))?.scrollIntoView({ behavior: 'smooth' })}
                  className="rounded-full px-4 py-2 text-[14px] font-medium text-white/70 transition hover:text-white">
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={goLogin} className="text-[15px] font-medium text-white/80 transition hover:text-white">Log In</button>
            <button onClick={() => navigate('/signup')} className="rounded-full bg-gradient-to-r from-[#4ADE80] to-[#22D3EE] px-6 py-2.5 text-[14px] font-semibold text-white transition-transform hover:scale-105">
              Sign Up
            </button>
          </div>
        </nav>

        {/* ==================== Hero Section ==================== */}
        <motion.section className="flex items-center gap-16 px-20 py-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.div className="flex-1 space-y-7" variants={fadeUp}>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#4ADE80]/25 bg-[#4ADE80]/8 px-4 py-2">
              <Sparkles className="h-3.5 w-3.5 text-[#4ADE80]" />
              <span className="text-[13px] font-medium text-[#4ADE80]">AI-Powered Nutrition Tracking</span>
            </div>

            <h1 className="text-[56px] font-bold leading-[1.1] tracking-tight text-white" style={{ letterSpacing: '-1.5px' }}>
              Track Your Meals,<br />Transform Your Health
            </h1>

            <p className="max-w-[540px] text-[18px] leading-relaxed text-white/50">
              Snap a photo of your food and let AI instantly analyze calories, macros, and nutritional value. Join 50,000+ users making smarter food choices every day.
            </p>

            <div className="flex items-center gap-4">
              <button onClick={goLogin} className="flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#4ADE80] to-[#22D3EE] px-9 py-4 text-[16px] font-semibold text-white transition-transform hover:scale-105">
                Start Free Today <ArrowRight className="h-[18px] w-[18px]" />
              </button>
              <button className="rounded-full border border-white/15 bg-white/5 px-9 py-4 text-[16px] font-medium text-white/80 transition hover:bg-white/10">
                Watch Demo
              </button>
            </div>

            <div className="flex items-center gap-8 pt-4">
              {[
                { num: '50K+', label: 'Active Users', color: '#4ADE80' },
                { num: '10M+', label: 'Meals Tracked', color: '#22D3EE' },
                { num: '4.9/5', label: 'App Rating', color: '#FFFFFF' },
              ].map((s, i) => (
                <div key={s.label} className="flex items-center gap-8">
                  {i > 0 && <div className="h-10 w-px bg-white/15" />}
                  <div>
                    <p className="text-[24px] font-bold" style={{ color: s.color }}>{s.num}</p>
                    <p className="text-[13px] text-white/40">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Mini Browser Preview */}
          <motion.div className="flex w-[560px] shrink-0 items-center justify-center" variants={fadeUp}>
            <div className="w-full overflow-hidden rounded-2xl border border-white/12 shadow-2xl" style={{ background: '#1A1833', boxShadow: '0 8px 40px rgba(0,0,0,0.25)' }}>
              <div className="flex items-center gap-2.5 border-b border-white/5 px-3.5 py-2.5">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                  <div className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
                  <div className="h-3 w-3 rounded-full bg-[#28C840]" />
                </div>
                <div className="flex-1 rounded-md bg-white/5 px-2.5 py-1 text-[11px] text-white/30">mydiet.app/dashboard</div>
              </div>
              <div className="flex gap-2.5 p-3">
                <div className="w-[120px] shrink-0 space-y-2 rounded-lg bg-white/4 p-2.5">
                  {['Dashboard', 'Meal Plan', 'Identifier', 'Community'].map((item, i) => (
                    <div key={item} className={`rounded-md px-2 py-1.5 text-[10px] ${i === 0 ? 'bg-[#4ADE80]/15 text-[#4ADE80]' : 'text-white/30'}`}>{item}</div>
                  ))}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1 rounded-lg bg-white/4 p-3">
                      <div className="mb-1 text-[9px] text-white/30">Calories</div>
                      <div className="text-[16px] font-bold text-[#4ADE80]">1,650</div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                        <div className="h-full w-3/4 rounded-full bg-[#4ADE80]" />
                      </div>
                    </div>
                    <div className="flex-1 rounded-lg bg-white/4 p-3">
                      <div className="mb-1 text-[9px] text-white/30">Protein</div>
                      <div className="text-[16px] font-bold text-[#22D3EE]">98g</div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                        <div className="h-full w-3/5 rounded-full bg-[#22D3EE]" />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-white/4 p-3">
                    <div className="mb-2 text-[10px] text-white/30">Today&apos;s Meals</div>
                    {['Oatmeal Bowl', 'Chicken Salad', 'Grilled Salmon'].map((m) => (
                      <div key={m} className="flex items-center justify-between border-t border-white/5 py-1.5 text-[10px]">
                        <span className="text-white/60">{m}</span>
                        <div className="h-3 w-3 rounded-full border border-[#4ADE80]/40 bg-[#4ADE80]/15" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* ==================== Features Section ==================== */}
        <motion.section id="features" className="px-20 py-16" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
          <motion.div className="mb-12 flex flex-col items-center text-center" variants={fadeUp}>
            <span className="mb-4 inline-flex items-center rounded-full border border-[#22D3EE]/20 bg-[#22D3EE]/8 px-3.5 py-1.5 text-[12px] font-semibold text-[#22D3EE]">Features</span>
            <h2 className="mb-4 text-[40px] font-bold tracking-tight text-white" style={{ letterSpacing: '-1px' }}>Everything You Need for<br />Smarter Nutrition</h2>
            <p className="text-[17px] text-white/40">Powerful AI tools wrapped in a beautifully simple interface</p>
          </motion.div>

          <div className="grid grid-cols-3 gap-5">
            {[
              { icon: SlidersHorizontal, color: '#4ADE80', title: 'Personalized Nutrition', desc: 'Get customized meal plans based on your body metrics, goals, and dietary preferences — tailored just for you.' },
              { icon: Camera, color: '#22D3EE', title: 'Photo Recognition', desc: 'Snap a photo of your food and let AI instantly analyze calories, macros, and nutritional content.' },
              { icon: Users, color: '#818CF8', title: 'Community', desc: 'Share recipes, join challenges, and connect with a community of health-conscious food lovers.' },
            ].map((f) => (
              <motion.div key={f.title} variants={fadeUp}
                className="rounded-[20px] border border-white/7 bg-white/5 p-7 backdrop-blur-md transition hover:bg-white/8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border" style={{ backgroundColor: f.color + '15', borderColor: f.color + '30' }}>
                  <f.icon className="h-6 w-6" style={{ color: f.color }} />
                </div>
                <h3 className="mb-2 text-[18px] font-semibold text-white/90">{f.title}</h3>
                <p className="text-[14px] leading-relaxed text-white/40">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ==================== How It Works ==================== */}
        <motion.section id="how-it-works" className="px-20 py-16" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
          <motion.div className="mb-12 flex flex-col items-center text-center" variants={fadeUp}>
            <span className="mb-4 inline-flex items-center rounded-full border border-[#4ADE80]/20 bg-[#4ADE80]/8 px-3.5 py-1.5 text-[12px] font-semibold text-[#4ADE80]">How It Works</span>
            <h2 className="text-[40px] font-bold tracking-tight text-white" style={{ letterSpacing: '-1px' }}>Three Simple Steps to<br />Healthier Eating</h2>
          </motion.div>

          <div className="grid grid-cols-3 gap-8">
            {[
              { num: '1', gradient: 'from-[#4ADE80] to-[#22D3EE]', title: 'Input Your Profile', desc: 'Tell us about yourself — your age, weight, height, activity level, and dietary goals for personalization.' },
              { num: '2', gradient: 'from-[#22D3EE] to-[#818CF8]', title: 'Personalized Meal Plans', desc: 'Receive AI-generated three-meal plans tailored to your nutritional needs, updated daily.' },
              { num: '3', gradient: 'from-[#818CF8] to-[#4ADE80]', title: 'Live Healthier', desc: 'Track your progress, share in the community, and build lasting healthy eating habits every day.' },
            ].map((s) => (
              <motion.div key={s.num} variants={fadeUp}
                className="flex flex-col items-center rounded-[20px] border border-white/6 bg-white/4 p-8 text-center">
                <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${s.gradient}`}>
                  <span className="text-[22px] font-bold text-white">{s.num}</span>
                </div>
                <h3 className="mb-3 text-[20px] font-semibold text-white/90">{s.title}</h3>
                <p className="text-[14px] leading-relaxed text-white/35">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ==================== Pricing Section ==================== */}
        <motion.section id="pricing" className="px-20 py-16" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
          <motion.div className="mb-12 flex flex-col items-center text-center" variants={fadeUp}>
            <span className="mb-4 inline-flex items-center rounded-full border border-[#F97316]/20 bg-[#F97316]/8 px-3.5 py-1.5 text-[12px] font-semibold text-[#F97316]">Pricing</span>
            <h2 className="mb-4 text-[40px] font-bold tracking-tight text-white" style={{ letterSpacing: '-1px' }}>Simple, Transparent Pricing</h2>
            <p className="text-[17px] text-white/40">Start free and upgrade when you need more features</p>
          </motion.div>

          <div className="flex justify-center gap-6">
            {/* Free Plan */}
            <motion.div variants={fadeUp} className="w-[380px] rounded-[20px] border border-white/7 bg-white/4 p-8">
              <div className="mb-2 space-y-2">
                <h3 className="text-[20px] font-semibold text-white/80">Free</h3>
                <p className="text-[14px] leading-snug text-white/35">Perfect for getting started with basic nutrition tracking</p>
              </div>
              <div className="my-5 flex items-end gap-1">
                <span className="text-[40px] font-bold text-white">$0</span>
                <span className="mb-1 text-[15px] text-white/35">/month</span>
              </div>
              <div className="mb-6 h-px w-full bg-white/6" />
              <div className="mb-6 space-y-3">
                {['Basic meal tracking', 'Daily nutrition summary', '7-day meal history'].map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#4ADE80]" />
                    <span className="text-[14px] text-white/60">{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={goLogin} className="flex h-11 w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[14px] font-semibold text-white/80 transition hover:bg-white/10">
                Get Started
              </button>
            </motion.div>

            {/* Pro Plan */}
            <motion.div variants={fadeUp} className="w-[380px] rounded-[20px] border-[1.5px] border-[#4ADE80]/20 bg-white/5 p-8 backdrop-blur-md">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#4ADE80] to-[#22D3EE] px-2.5 py-1">
                <Crown className="h-3 w-3 text-white" />
                <span className="text-[11px] font-semibold text-white">Most Popular</span>
              </div>
              <div className="mb-2 space-y-2">
                <h3 className="text-[20px] font-semibold text-[#4ADE80]">Pro</h3>
                <p className="text-[14px] leading-snug text-white/35">For serious health enthusiasts who want full AI power</p>
              </div>
              <div className="my-5 flex items-end gap-1">
                <span className="text-[40px] font-bold text-white">$9.99</span>
                <span className="mb-1 text-[15px] text-white/35">/month</span>
              </div>
              <div className="mb-6 h-px w-full bg-white/6" />
              <div className="mb-6 space-y-3">
                {['Unlimited meal tracking', 'AI photo recognition', 'Community access', 'Personalized plans', 'Weekly reports'].map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#4ADE80]" />
                    <span className="text-[14px] text-white/60">{f}</span>
                  </div>
                ))}
              </div>
              <button className="flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#4ADE80] to-[#22D3EE] text-[14px] font-semibold text-white transition-transform hover:scale-[1.02]">
                Upgrade to Pro
              </button>
            </motion.div>
          </div>
        </motion.section>

        {/* ==================== Testimonials Section ==================== */}
        <motion.section id="testimonials" className="px-20 py-16" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
          <motion.div className="mb-12 flex flex-col items-center text-center" variants={fadeUp}>
            <span className="mb-4 inline-flex items-center rounded-full border border-[#818CF8]/20 bg-[#818CF8]/8 px-3.5 py-1.5 text-[12px] font-semibold text-[#818CF8]">Testimonials</span>
            <h2 className="text-[40px] font-bold tracking-tight text-white" style={{ letterSpacing: '-1px' }}>Loved by Health-Conscious<br />Users Worldwide</h2>
          </motion.div>

          <div className="grid grid-cols-3 gap-5">
            {[
              { quote: '"MyDiet\'s personalized meal plans completely changed how I eat. Lost 12kg in 3 months without feeling hungry!"', name: 'Sarah Johnson', role: 'Lost 12kg', gradient: 'from-[#4ADE80] to-[#22D3EE]' },
              { quote: '"The photo recognition is incredibly accurate. I just snap my plate and it knows exactly what I\'m eating!"', name: 'Mark Chen', role: 'Tech Enthusiast', gradient: 'from-[#22D3EE] to-[#818CF8]' },
              { quote: '"The community feature keeps me motivated. Sharing my journey and seeing others succeed is amazing."', name: 'Emily Davis', role: 'Fitness Coach', gradient: 'from-[#818CF8] to-[#4ADE80]' },
            ].map((t) => (
              <motion.div key={t.name} variants={fadeUp}
                className="rounded-[20px] border border-white/6 bg-white/4 p-7">
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#FBBF24] text-[#FBBF24]" />
                  ))}
                </div>
                <p className="mb-5 text-[14px] leading-relaxed text-white/55">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${t.gradient}`}>
                    <span className="text-[14px] font-bold text-white">{t.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-white/80">{t.name}</p>
                    <p className="text-[12px] text-white/40">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ==================== CTA Section ==================== */}
        <motion.section className="px-[120px] py-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <div className="flex flex-col items-center rounded-3xl border border-[#4ADE80]/15 p-16 text-center" style={{ background: 'linear-gradient(135deg, rgba(74,222,128,0.08) 0%, rgba(34,211,238,0.08) 100%)' }}>
            <h2 className="mb-5 text-[40px] font-bold tracking-tight text-white" style={{ letterSpacing: '-1px' }}>Ready to Transform<br />Your Nutrition?</h2>
            <p className="mb-8 max-w-[500px] text-[17px] leading-relaxed text-white/45">Join 50,000+ users who are already making smarter food choices. Start your free trial today.</p>
            <button onClick={goLogin} className="flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#4ADE80] to-[#22D3EE] px-10 py-[18px] text-[16px] font-semibold text-white transition-transform hover:scale-105">
              Get Started Free <ArrowRight className="h-[18px] w-[18px]" />
            </button>
            <p className="mt-5 text-[13px] text-white/30">No credit card required · Free forever with basic features</p>
          </div>
        </motion.section>

        {/* ==================== Footer ==================== */}
        <footer className="flex items-center justify-between border-t border-white/6 px-20 py-8">
          <div className="flex items-center gap-2.5">
            <Leaf className="h-5 w-5 text-[#4ADE80]" />
            <span className="text-[16px] font-semibold text-white/55">MyDiet</span>
          </div>
          <p className="text-[13px] text-white/28">© 2026 MyDiet. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'Contact'].map((link) => (
              <span key={link} className="cursor-pointer text-[13px] font-medium text-white/40 transition hover:text-white/70">{link}</span>
            ))}
          </div>
        </footer>
      </div>
    </div>
  )
}
