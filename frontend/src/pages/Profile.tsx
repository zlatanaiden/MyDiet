import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Pencil, Check, User, Shield, ArrowRightLeft, LogOut, Heart, ArrowLeft } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { weightHistory } from '../data/mockData'

export default function Profile() {
  // Get parameters from URL
  const { username } = useParams<{ username?: string }>() 
  // Extract toggleFollow from useApp
  const { user: currentUser, posts, updateWeight, unit, setUnit, signOut, toggleFollow } = useApp()
  const navigate = useNavigate()

  // Check if this is the current logged-in user's profile 
  // (True if no parameter is provided, or if the parameter matches the current username)
  const isCurrentUser = !username || username === currentUser.name
  const profileName = isCurrentUser ? currentUser.name : username

  // Filter posts belonging to the profile owner
  const profilePosts = posts.filter(post => post.author === profileName)

  // For other users' profiles, simulate some basic data
  const displayUser = isCurrentUser ? currentUser : {
    ...currentUser,
    name: profileName,
    uid: profilePosts.length > 0 && profilePosts[0].authorId
      ? `UID-${String(profilePosts[0].authorId).padStart(6, '0')}`
      : `UID-${String(Math.abs(profileName!.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)) % 1000000).padStart(6, '0')}`,
    followers: Math.floor(Math.random() * 500) + 100,
    following: Math.floor(Math.random() * 300) + 50,
    totalLikes: profilePosts.reduce((sum, p) => sum + p.likes, 0),
    posts: profilePosts.length,
  }

  // Check if the current user is following the profile owner
  const isFollowing = currentUser.followingList?.includes(displayUser.name!)

  const [editingWeight, setEditingWeight] = useState(false)
  const [tempWeight, setTempWeight] = useState(currentUser.weight)
  const [privacyGoal, setPrivacyGoal] = useState(true)
  const [privacyRecipe, setPrivacyRecipe] = useState(false)

  const saveWeight = () => {
    updateWeight(tempWeight)
    setEditingWeight(false)
  }

  const convertWeight = (kg: number) => unit === 'metric' ? `${kg} kg` : `${(kg * 2.205).toFixed(1)} lb`
  const convertHeight = (cm: number) => unit === 'metric' ? `${cm} cm` : `${Math.floor(cm / 2.54 / 12)}' ${Math.round(cm / 2.54 % 12)}"`

  const bmiColor = currentUser.bmi < 18.5 ? '#22D3EE' : currentUser.bmi < 25 ? '#4ADE80' : currentUser.bmi < 30 ? '#F97316' : '#EF4444'
  const bmiLabel = currentUser.bmi < 18.5 ? 'Underweight' : currentUser.bmi < 25 ? 'Normal' : currentUser.bmi < 30 ? 'Overweight' : 'Obese'

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Add a back button if it's another user's profile */}
      {!isCurrentUser && (
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/60 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to Community
        </button>
      )}

      <div className="flex gap-6">
        {/* Left Column */}
        <div className="flex-1 space-y-5">
          {/* Bio Card */}
          <div className="glass flex items-center gap-5 rounded-2xl p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#4ADE80] to-[#22D3EE]">
              <User className="h-10 w-10 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-[22px] font-bold text-white">{displayUser.name}</h1>
              <p className="text-[13px] text-white/40">{displayUser.uid}</p>
              
              {isCurrentUser && (
                <div className="mt-2 flex gap-3">
                  <span className="rounded-full bg-white/5 px-3 py-1 text-[12px] text-white/50">{currentUser.gender}</span>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-[12px] text-white/50">{currentUser.age} years</span>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-[12px] text-white/50">{convertHeight(currentUser.height)}</span>
                </div>
              )}
            </div>
            {/* Account actions (Only show for current user) */}
            {isCurrentUser && (
              <div className="flex flex-col gap-2">
                <button onClick={() => { signOut(); navigate('/login', { replace: true }) }}
                  className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-[12px] text-white/60 transition hover:bg-white/10 hover:text-white">
                  <ArrowRightLeft className="h-3.5 w-3.5" /> Change Account
                </button>
                <button onClick={() => { signOut(); navigate('/login', { replace: true }) }}
                  className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-[12px] text-[#F87171]/60 transition hover:bg-[#F87171]/10 hover:text-[#F87171]">
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </button>
              </div>
            )}
            {/* Follow button for other users */}
            {!isCurrentUser && (
              <button 
                onClick={() => toggleFollow(displayUser.name!)}
                className={`rounded-xl px-6 py-2.5 text-[14px] font-bold transition ${
                  isFollowing 
                    ? 'bg-white/10 text-white hover:bg-white/20 ring-1 ring-white/20' // Style for 'Following'
                    : 'bg-gradient-to-r from-[#4ADE80] to-[#22D3EE] text-[#1a1a2e] hover:opacity-90' // Style for 'Follow'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          {/* Health Metrics & Chart - ONLY FOR CURRENT USER */}
          {isCurrentUser && (
            <>
              <div className="glass rounded-2xl p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-[16px] font-bold text-white">Health Metrics</h2>
                  <div className="glass inline-flex rounded-full p-0.5">
                    <button onClick={() => setUnit('metric')}
                      className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${unit === 'metric' ? 'bg-[#4ADE80]/20 text-[#4ADE80]' : 'text-white/40'}`}>
                      kg/cm
                    </button>
                    <button onClick={() => setUnit('imperial')}
                      className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${unit === 'imperial' ? 'bg-[#4ADE80]/20 text-[#4ADE80]' : 'text-white/40'}`}>
                      lb/ft
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {/* Current Weight */}
                  <div className="rounded-xl bg-white/5 p-4 text-center">
                    <p className="text-[11px] text-white/40">Current Weight</p>
                    <div className="my-1 flex items-center justify-center gap-1">
                      {editingWeight ? (
                        <div className="flex items-center gap-1">
                          <input type="number" value={tempWeight} onChange={e => setTempWeight(+e.target.value)}
                            className="w-16 bg-transparent text-center text-[22px] font-bold text-white outline-none"
                            autoFocus onKeyDown={e => e.key === 'Enter' && saveWeight()} />
                          <button onClick={saveWeight} className="text-[#4ADE80]"><Check className="h-4 w-4" /></button>
                        </div>
                      ) : (
                        <>
                          <span className="text-[22px] font-bold text-white">{convertWeight(currentUser.weight)}</span>
                          <button onClick={() => { setEditingWeight(true); setTempWeight(currentUser.weight) }}
                            className="text-white/30 hover:text-white"><Pencil className="h-3 w-3" /></button>
                        </>
                      )}
                    </div>
                  </div>
                  {/* Target Weight */}
                  <div className="rounded-xl bg-white/5 p-4 text-center">
                    <p className="text-[11px] text-white/40">Target Weight</p>
                    <p className="my-1 text-[22px] font-bold text-[#4ADE80]">{convertWeight(currentUser.targetWeight)}</p>
                  </div>
                  {/* Days Remaining */}
                  <div className="rounded-xl bg-white/5 p-4 text-center">
                    <p className="text-[11px] text-white/40">Days Remaining</p>
                    <p className="my-1 text-[22px] font-bold text-[#22D3EE]">{currentUser.daysRemaining}</p>
                  </div>
                  {/* BMI */}
                  <div className="rounded-xl bg-white/5 p-4 text-center">
                    <p className="text-[11px] text-white/40">BMI</p>
                    <p className="my-1 text-[22px] font-bold" style={{ color: bmiColor }}>{currentUser.bmi}</p>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{ backgroundColor: bmiColor + '20', color: bmiColor }}>
                      {bmiLabel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <h2 className="mb-4 text-[16px] font-bold text-white">Body Composition History</h2>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} interval={4} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false}
                        domain={['dataMin - 1', 'dataMax + 1']}
                        tickFormatter={(v: number) => v.toFixed(1)} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                        labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                        formatter={(value: number) => value.toFixed(1)} />
                      <Line type="monotone" dataKey="weight" stroke="#4ADE80" strokeWidth={2} dot={false} name="Weight (kg)" />
                      <Line type="monotone" dataKey="bodyFat" stroke="#F97316" strokeWidth={2} dot={false} name="Body Fat (%)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column */}
        <div className="w-[340px] shrink-0 space-y-5">
          {/* Preferences - ONLY FOR CURRENT USER */}
          {isCurrentUser && (
            <div className="glass rounded-2xl p-6">
              <h2 className="mb-4 text-[16px] font-bold text-white">Preferences & Restrictions</h2>
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-white/40">Allergens</p>
                  <div className="flex flex-wrap gap-2">
                    {currentUser.allergies.map(a => (
                      <span key={a} className="rounded-full bg-red-500/10 px-3 py-1.5 text-[12px] font-medium text-red-400">{a}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-white/40">Restrictions</p>
                  <div className="flex flex-wrap gap-2">
                    {currentUser.restrictions.map(r => (
                      <span key={r} className="rounded-full bg-[#F97316]/10 px-3 py-1.5 text-[12px] font-medium text-[#F97316]">{r}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social Summary (Visible for everyone) */}
          <div className="glass rounded-2xl p-6">
            <h2 className="mb-4 text-[16px] font-bold text-white">Social Summary</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Posts', value: profilePosts.length, color: '#4ADE80' },
                { label: 'Total Likes', value: displayUser.totalLikes, color: '#F472B6' },
                { label: 'Saved', value: isCurrentUser ? currentUser.savedRecipes : 0, color: '#FBBF24' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-white/5 p-3 text-center">
                  <p className="text-[20px] font-bold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[11px] text-white/40">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/5 p-3 text-center">
                <p className="text-[20px] font-bold text-[#22D3EE]">{displayUser.followers}</p>
                <p className="text-[11px] text-white/40">Followers</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3 text-center">
                <p className="text-[20px] font-bold text-[#A78BFA]">{displayUser.following}</p>
                <p className="text-[11px] text-white/40">Following</p>
              </div>
            </div>
          </div>

          {/* Privacy & Settings - ONLY FOR CURRENT USER */}
          {isCurrentUser && (
            <div className="glass rounded-2xl p-6">
              <div className="mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-white/60" />
                <h2 className="text-[16px] font-bold text-white">Privacy & Settings</h2>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Show weight loss goal in community', checked: privacyGoal, onChange: () => setPrivacyGoal(v => !v) },
                  { label: 'Share today\'s recipe publicly', checked: privacyRecipe, onChange: () => setPrivacyRecipe(v => !v) },
                ].map((toggle) => (
                  <div key={toggle.label} className="flex items-center justify-between">
                    <span className="text-[13px] text-white/60">{toggle.label}</span>
                    <button onClick={toggle.onChange}
                      className={`relative h-6 w-11 rounded-full transition-colors ${toggle.checked ? 'bg-[#4ADE80]' : 'bg-white/15'}`}>
                      <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${toggle.checked ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Following List - ONLY FOR CURRENT USER */}
          {isCurrentUser && (
            <div className="glass rounded-2xl p-6">
              <h2 className="mb-4 text-[16px] font-bold text-white">Following ({currentUser.followingList?.length || 0})</h2>
              
              {(!currentUser.followingList || currentUser.followingList.length === 0) ? (
                <p className="text-[13px] text-white/40">You are not following anyone yet.</p>
              ) : (
                <div className="flex max-h-[200px] flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar">
                  {currentUser.followingList.map(name => (
                    <div 
                      key={name}
                      onClick={() => navigate(`/profile/${encodeURIComponent(name)}`)}
                      className="flex cursor-pointer items-center gap-3 rounded-xl bg-white/5 p-3 transition hover:bg-white/10"
                    >
                      {/* Placeholder avatar for the followed user */}
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FBBF24] to-[#F97316]">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <span className="truncate text-[13px] font-medium text-white/80 transition hover:text-[#4ADE80]">{name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Published Posts */}
      <div className="glass rounded-2xl p-6">
        <h2 className="mb-4 text-[18px] font-bold text-white">{isCurrentUser ? 'My Published Posts' : `${displayUser.name}'s Posts`}</h2>
        {profilePosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <p className="text-[14px] text-white/40">No posts published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {profilePosts.map(post => (
              <div key={post.id} className="group overflow-hidden rounded-2xl bg-white/5 transition-all hover:bg-white/10 ring-1 ring-white/10">
                <div className="relative h-40">
                  <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
                </div>
                <div className="p-4">
                  <p className="mb-2 line-clamp-2 text-[13px] font-semibold leading-snug text-white">{post.title}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Heart className={`h-3.5 w-3.5 ${post.liked ? 'fill-[#F472B6] text-[#F472B6]' : 'text-white/40'}`} />
                      <span className="text-[11px] text-white/50">{post.likes}</span>
                    </div>
                    {post.tags.length > 0 && (
                      <span className="rounded-full bg-[#4ADE80]/10 px-2 py-0.5 text-[10px] text-[#4ADE80]">{post.tags[0]}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}