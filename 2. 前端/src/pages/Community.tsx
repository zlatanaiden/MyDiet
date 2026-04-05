import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, Send, X, Search, RefreshCw, Plus, TrendingUp, Clock, Trophy, Trash2, CornerDownRight } from 'lucide-react'
import { trendingTags, topContributors, type Post, type Comment } from '../data/mockData'
import { useApp } from '../context/AppContext'
import { useNavigate } from 'react-router-dom' // New import

// ==================== Nested Comment Item (Bug 6: 楼中楼) ====================
function CommentItem({ comment, postId, depth = 0, onReplyTo }: {
  comment: Comment
  postId: string
  depth?: number
  onReplyTo: (commentId: string, author: string) => void
}) {
  const navigate = useNavigate()
  const { deleteComment, updatePostComments, posts, trendingPostsList, toggleCommentLike } = useApp()
  const isOwn = comment.author === 'You'
  const handleLike = () => {
    toggleCommentLike(postId, comment.id)
  }

  const handleDelete = () => {
    deleteComment(postId, comment.id)
  }

  return (
    <div className={`${depth > 0 ? 'ml-6 border-l border-white/10 pl-4' : ''}`}>
      <div className="flex gap-3 py-2">
        {/* Clickable Avatar */}
        <div 
          onClick={() => navigate(`/profile/${encodeURIComponent(comment.author)}`)}
          className={`h-7 w-7 shrink-0 cursor-pointer rounded-full bg-gradient-to-br ${comment.avatarGradient} transition hover:opacity-80`} 
          title={`Visit ${comment.author}'s profile`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {/* Clickable Name */}
            <span 
              onClick={() => navigate(`/profile/${encodeURIComponent(comment.author)}`)}
              className="cursor-pointer text-[13px] font-semibold text-white transition hover:text-[#4ADE80]"
            >
              {comment.author}
            </span>
            <span className="text-[11px] text-white/30">{comment.time}</span>
            {isOwn && (
              <button onClick={handleDelete}
                className="ml-auto flex items-center gap-1 text-[11px] text-white/25 transition hover:text-[#F87171]"
                title="Delete comment">
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
          <p className="text-[13px] leading-relaxed text-white/60 break-words">{comment.text}</p>
          <div className="mt-1 flex gap-4">
            <button onClick={handleLike}
              className={`flex items-center gap-1 text-[11px] transition ${comment.liked ? 'text-[#F472B6]' : 'text-white/30 hover:text-[#F472B6]'}`}>
              <Heart className={`h-3 w-3 ${comment.liked ? 'fill-[#F472B6]' : ''}`} /> {comment.likes}
            </button>
            <button onClick={() => onReplyTo(comment.id, comment.author)}
              className="flex items-center gap-1 text-[11px] text-white/30 transition hover:text-white">
              <CornerDownRight className="h-3 w-3" /> Reply
            </button>
          </div>
        </div>
      </div>

      {/* Nested replies (楼中楼) */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-1">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
              onReplyTo={onReplyTo}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ==================== Create Post Modal ====================
function CreatePostModal({ onClose }: { onClose: () => void }) {
  const { addPost, user } = useApp()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null) // Store image Base64 data

  // Handle local image upload and convert to Base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        // Once read, save the result to state for preview and posting
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return

    // Process tags, ensure they start with #
    const formattedTags = tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
      .map(t => (t.startsWith('#') ? t : `#${t}`))

    const newPost: Post = {
      id: `new-post-${Date.now()}`,
      title,
      content,
      // Use Base64 data if user uploaded an image, otherwise use default placeholder
      image: imagePreview || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop', 
      author: user.name || 'You',
      avatarGradient: 'from-[#4ADE80] to-[#22D3EE]',
      likes: 0,
      liked: false,
      tags: formattedTags.length > 0 ? formattedTags : ['#HealthyEating'],
      comments: []
    }

    addPost(newPost)
    onClose()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-8"
      onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-[#1a1a2e] shadow-2xl">
        
        <div className="border-b border-white/10 p-5">
          <h3 className="text-[18px] font-bold text-white">Create New Post</h3>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <label className="mb-1.5 block text-[13px] text-white/60">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="What's on your mind?"
              className="w-full rounded-xl bg-white/5 px-4 py-2.5 text-[13px] text-white placeholder-white/30 outline-none ring-1 ring-white/10 focus:ring-[#4ADE80]/50" />
          </div>
          
          <div>
            <label className="mb-1.5 block text-[13px] text-white/60">Content</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Share your recipe or progress..." rows={4}
              className="w-full resize-none rounded-xl bg-white/5 px-4 py-2.5 text-[13px] text-white placeholder-white/30 outline-none ring-1 ring-white/10 focus:ring-[#4ADE80]/50" />
          </div>

          {/* Local image upload component */}
          <div>
            <label className="mb-1.5 block text-[13px] text-white/60">Photo (Optional)</label>
            <div className="flex items-center gap-4">
              <label className="flex cursor-pointer items-center justify-center rounded-xl bg-white/5 px-4 py-2.5 text-[13px] text-white transition hover:bg-white/10 ring-1 ring-white/10">
                <span>Choose File</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
              
              {/* Image preview area */}
              {imagePreview && (
                <div className="relative h-12 w-12 overflow-hidden rounded-lg ring-1 ring-white/20">
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  <button onClick={() => setImagePreview(null)}
                    className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center bg-black/60 text-white/80 transition hover:bg-black hover:text-white"
                    title="Remove image">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] text-white/60">Tags (comma separated)</label>
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder="Healthy, MealPrep, Keto..."
              className="w-full rounded-xl bg-white/5 px-4 py-2.5 text-[13px] text-white placeholder-white/30 outline-none ring-1 ring-white/10 focus:ring-[#4ADE80]/50" />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-white/10 p-4">
          <button onClick={onClose} className="rounded-xl px-4 py-2 text-[13px] text-white/60 transition hover:bg-white/5 hover:text-white">Cancel</button>
          <button onClick={handleSubmit} disabled={!title.trim() || !content.trim()}
            className="rounded-xl bg-gradient-to-r from-[#4ADE80] to-[#22D3EE] px-6 py-2 text-[13px] font-bold text-[#1a1a2e] transition hover:opacity-90 disabled:opacity-50">
            Post
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ==================== Post Modal (4-2) ====================
function PostModal({ postId, onClose }: { postId: string; onClose: () => void }) {
  const navigate = useNavigate()
  const { posts, trendingPostsList, addComment, addReplyToComment, togglePostLike } = useApp()
  const [commentText, setCommentText] = useState('')
  const [replyTarget, setReplyTarget] = useState<{ commentId: string; author: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Always read fresh post data from context so new comments and like state show
  const post = [...posts, ...trendingPostsList].find(p => p.id === postId)

  if (!post) return null

  const handleLike = () => togglePostLike(post.id)

  // Count all comments (including nested replies)
  const countComments = (comments: Comment[]): number => {
    return comments.reduce((sum, c) => sum + 1 + (c.replies ? countComments(c.replies) : 0), 0)
  }

  const handleComment = () => {
    if (!commentText.trim()) return
    const newComment: Comment = {
      id: `new-${Date.now()}`,
      author: 'You',
      avatarGradient: 'from-[#4ADE80] to-[#22D3EE]',
      text: commentText,
      likes: 0,
      time: 'Just now',
    }

    if (replyTarget) {
      // Bug 6: nested reply (楼中楼)
      addReplyToComment(post.id, replyTarget.commentId, newComment)
    } else {
      // Bug 6: new comment goes to top
      addComment(post.id, newComment)
    }
    setCommentText('')
    setReplyTarget(null)
  }

  const handleReplyTo = (commentId: string, author: string) => {
    setReplyTarget({ commentId, author })
    setCommentText('')
    inputRef.current?.focus()
  }

  const cancelReply = () => {
    setReplyTarget(null)
    setCommentText('')
  }

  const focusComment = () => inputRef.current?.focus()

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-8"
      onClick={onClose}>
      {/* Dimmed bg */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 flex h-[80vh] max-w-5xl overflow-hidden rounded-2xl bg-[#1a1a2e] shadow-2xl">

        {/* Left: Image */}
        <div className="relative flex w-[55%] items-center justify-center bg-black">
          <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
          {post.nutrition && (
            <div className="absolute bottom-4 left-4 rounded-xl bg-black/60 px-3 py-2 backdrop-blur-sm">
              <span className="text-[13px] font-bold text-[#4ADE80]">{post.nutrition.calories} kcal</span>
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="flex w-[45%] flex-col">
          {/* Header */}
          <div 
            onClick={() => navigate(`/profile/${encodeURIComponent(post.author)}`)}
            className="group flex cursor-pointer items-center gap-3 border-b border-white/10 p-5 transition hover:bg-white/5"
            title={`Visit ${post.author}'s profile`}
          >
            <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${post.avatarGradient} transition group-hover:scale-105`} />
            <div>
              <p className="text-[14px] font-semibold text-white transition group-hover:text-[#4ADE80]">{post.author}</p>
              <div className="flex gap-2">
                {post.tags.map(t => (
                  <span key={t} className="text-[11px] text-[#4ADE80]">{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-5">
            <h3 className="mb-2 text-[18px] font-bold text-white">{post.title}</h3>
            <p className="mb-6 text-[14px] leading-relaxed text-white/60">{post.content}</p>

            {/* Comments — nested (楼中楼) */}
            <div className="space-y-1">
              <h4 className="text-[13px] font-semibold uppercase tracking-wider text-white/40">
                Comments ({countComments(post.comments)})
              </h4>
              {post.comments.map((c) => (
                <CommentItem key={c.id} comment={c}
                  postId={post.id}
                  onReplyTo={handleReplyTo} />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-white/10 p-4">
            <div className="mb-3 flex items-center gap-4">
              <button onClick={handleLike} className="flex items-center gap-1.5 text-[13px]">
                <Heart className={`h-5 w-5 ${post.liked ? 'fill-[#F472B6] text-[#F472B6]' : 'text-white/50'}`} />
                <span className="text-white/60">{post.likes.toLocaleString()}</span>
              </button>
              <button onClick={focusComment} className="flex items-center gap-1.5 text-[13px] text-white/50">
                <MessageCircle className="h-5 w-5" /> Comment
              </button>
            </div>

            {/* Reply indicator */}
            {replyTarget && (
              <div className="mb-2 flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5">
                <CornerDownRight className="h-3 w-3 text-[#4ADE80]" />
                <span className="flex-1 text-[12px] text-white/50">
                  Replying to <span className="font-semibold text-[#4ADE80]">{replyTarget.author}</span>
                </span>
                <button onClick={cancelReply} className="text-white/30 hover:text-white">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <input ref={inputRef} value={commentText} onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleComment()}
                placeholder={replyTarget ? `Reply to ${replyTarget.author}...` : 'Write a comment...'}
                className="flex-1 rounded-xl bg-white/5 px-4 py-2.5 text-[13px] text-white placeholder-white/30 outline-none ring-1 ring-white/10 focus:ring-[#4ADE80]/50" />
              <button onClick={handleComment}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4ADE80]/20 text-[#4ADE80] transition hover:bg-[#4ADE80]/30">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Close button */}
        <button onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur-sm transition hover:bg-black/60">
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    </motion.div>
  )
}

// ==================== Post Card ====================
function PostCard({ post, onClick }: { post: Post; onClick: () => void }) {
  const navigate = useNavigate() // Make sure this hook is INSIDE the component
  const { togglePostLike } = useApp()
  const [showHeart, setShowHeart] = useState(false)

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!post.liked) {
      togglePostLike(post.id)
      setShowHeart(true)
      setTimeout(() => setShowHeart(false), 800)
    }
  }

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="glass group cursor-pointer overflow-hidden rounded-2xl transition-all hover:bg-white/10"
      onClick={onClick} onDoubleClick={handleDoubleClick}>
      <div className="relative">
        <img src={post.image} alt={post.title} className="w-full object-cover" />
        <AnimatePresence>
          {showHeart && (
            <motion.div className="animate-heart absolute inset-0 flex items-center justify-center">
              <Heart className="h-16 w-16 fill-[#F472B6] text-[#F472B6]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="p-4">
        <p className="mb-2 line-clamp-2 text-[13px] font-semibold leading-snug text-white">{post.title}</p>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {post.tags.map(t => (
            <span key={t} className="rounded-full bg-[#4ADE80]/10 px-2 py-0.5 text-[10px] font-medium text-[#4ADE80]">{t}</span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          
          {/* === Avatar & Name (Click to Navigate) === */}
          <div 
            onClick={(e) => {
              e.stopPropagation() // Prevent opening the post modal
              navigate(`/profile/${encodeURIComponent(post.author)}`) // Arrow function is CRITICAL here
            }}
            className="flex cursor-pointer items-center gap-2 rounded-lg p-1 transition hover:bg-white/5"
            title={`Visit ${post.author}'s profile`}
          >
            <div className={`h-5 w-5 rounded-full bg-gradient-to-br ${post.avatarGradient}`} />
            <span className="text-[11px] font-medium text-white/70 transition hover:text-[#4ADE80]">{post.author}</span>
          </div>
          {/* ========================================= */}

          <div className="flex items-center gap-1">
            <Heart className={`h-3.5 w-3.5 ${post.liked ? 'fill-[#F472B6] text-[#F472B6]' : 'text-white/40'}`} />
            <span className="text-[11px] text-white/50">{post.likes >= 1000 ? `${(post.likes/1000).toFixed(1)}k` : post.likes}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ==================== Trending Post Card ====================
function TrendingPostCard({ post, onClick }: { post: Post; onClick: () => void }) {
  const navigate = useNavigate() // <--- 1. Add this line here
  const { togglePostLike } = useApp()
  const [showHeart, setShowHeart] = useState(false)

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!post.liked) {
      togglePostLike(post.id)
      setShowHeart(true)
      setTimeout(() => setShowHeart(false), 800)
    }
  }

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="glass group cursor-pointer overflow-hidden rounded-2xl transition-all hover:bg-white/10"
      onClick={onClick} onDoubleClick={handleDoubleClick}>
      <div className="relative">
        <img src={post.image} alt={post.title} className="w-full object-cover" />
        <AnimatePresence>
          {showHeart && (
            <motion.div className="animate-heart absolute inset-0 flex items-center justify-center">
              <Heart className="h-16 w-16 fill-[#F472B6] text-[#F472B6]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="p-4">
        <p className="mb-2 line-clamp-2 text-[13px] font-semibold leading-snug text-white">{post.title}</p>
        <div className="mb-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-[#F97316]/15 px-2 py-0.5 text-[10px] font-bold text-[#F97316]">
            <span className="mr-0.5">🔥</span>{post.likes >= 1000 ? `${(post.likes/1000).toFixed(1)}k` : post.likes}
          </span>
          {post.tags.map(t => (
            <span key={t} className="rounded-full bg-[#4ADE80]/10 px-2 py-0.5 text-[10px] text-[#4ADE80]">{t}</span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          
          {/* === 2. Replaced the avatar section here === */}
          <div 
            onClick={(e) => {
              e.stopPropagation() // Prevent bubbling to avoid opening the post modal
              navigate(`/profile/${encodeURIComponent(post.author)}`)
            }}
            className="flex cursor-pointer items-center gap-2 rounded-lg p-1 transition hover:bg-white/5"
            title={`Visit ${post.author}'s profile`}
          >
            <div className={`h-5 w-5 rounded-full bg-gradient-to-br ${post.avatarGradient}`} />
            <span className="text-[11px] font-medium text-white/70 transition hover:text-[#4ADE80]">{post.author}</span>
          </div>
          {/* =========================================== */}

          <div className="flex items-center gap-1">
            <Heart className={`h-3.5 w-3.5 ${post.liked ? 'fill-[#F472B6] text-[#F472B6]' : 'text-white/40'}`} />
            <span className="text-[11px] text-white/50">{post.likes >= 1000 ? `${(post.likes/1000).toFixed(1)}k` : post.likes}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ==================== Community ====================
export default function Community() {
  const { posts, trendingPostsList, refreshPosts } = useApp()
  const [tab, setTab] = useState<'recommended' | 'trending'>('recommended')
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Bug 7: search state
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSearch, setActiveSearch] = useState('')

  const handleRefresh = () => {
    refreshPosts()
    setRefreshKey(k => k + 1)
  }

  // Bug 7: Execute search on Enter or when clicking search icon
  const executeSearch = () => {
    setActiveSearch(searchQuery.trim().toLowerCase())
  }

  const clearSearch = () => {
    setSearchQuery('')
    setActiveSearch('')
  }

  const rawPosts = tab === 'recommended' ? posts : trendingPostsList

  // Bug 7: Filter posts by keyword (title, tags, author, content)
  const activePosts = activeSearch
    ? rawPosts.filter(p =>
        p.title.toLowerCase().includes(activeSearch) ||
        p.author.toLowerCase().includes(activeSearch) ||
        p.content.toLowerCase().includes(activeSearch) ||
        p.tags.some(t => t.toLowerCase().includes(activeSearch))
      )
    : rawPosts

  // Split posts into columns for masonry
  const cols = tab === 'recommended' ? 3 : 4
  const columns: Post[][] = Array.from({ length: cols }, () => [])
  activePosts.forEach((p, i) => columns[i % cols].push(p))

  return (
    <div className="space-y-5">
      {/* Top Bar */}
      <div className="flex items-center gap-5">
        <div className="glass inline-flex rounded-full p-1">
          <button onClick={() => setTab('recommended')}
            className={`rounded-full px-5 py-2 text-[13px] font-medium transition-all duration-200 hover:scale-105 ${
              tab === 'recommended' ? 'bg-[#4ADE80]/20 text-[#4ADE80]' : 'text-white/50 hover:text-white/80'
            }`}>Recommended</button>
          <button onClick={() => setTab('trending')}
            className={`rounded-full px-5 py-2 text-[13px] font-medium transition-all duration-200 hover:scale-105 ${
              tab === 'trending' ? 'bg-[#F97316]/20 text-[#F97316]' : 'text-white/50 hover:text-white/80'
            }`}>Trending</button>
        </div>

        <div className="glass flex flex-1 items-center gap-2.5 rounded-full px-4 py-2.5">
          <button onClick={executeSearch} className="shrink-0">
            <Search className="h-4 w-4 text-white/40 transition hover:text-white" />
          </button>
          <input value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') executeSearch() }}
            placeholder="Search posts, recipes... (press Enter)"
            className="flex-1 bg-transparent text-[13px] text-white placeholder-white/30 outline-none" />
          {activeSearch && (
            <button onClick={clearSearch} className="shrink-0 text-white/30 transition hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {tab === 'trending' && (
          <div className="glass flex items-center gap-2 rounded-full px-4 py-2">
            <Clock className="h-3.5 w-3.5 text-[#F97316]" />
            <span className="text-[12px] text-white/70">Last 24 Hours</span>
          </div>
        )}
      </div>

      {tab === 'trending' && (
        <div className="flex items-center gap-3 rounded-xl bg-[#F97316]/5 px-5 py-3">
          <TrendingUp className="h-4 w-4 text-[#F97316]" />
          <span className="text-[13px] text-white/60">
            <span className="mr-1">🔥</span>Trending Now — Posts with the most engagement in the last 24 hours
          </span>
        </div>
      )}

      {/* Search result indicator */}
      {activeSearch && (
        <div className="flex items-center gap-3 rounded-xl bg-[#4ADE80]/5 px-5 py-3">
          <Search className="h-4 w-4 text-[#4ADE80]" />
          <span className="flex-1 text-[13px] text-white/60">
            Found <span className="font-semibold text-[#4ADE80]">{activePosts.length}</span> results for &quot;<span className="text-white">{activeSearch}</span>&quot;
          </span>
          <button onClick={clearSearch} className="text-[12px] text-white/40 underline transition hover:text-white">
            Clear search
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex gap-5">
        <motion.div key={refreshKey + activeSearch} className="flex flex-1 gap-5"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          {activePosts.length === 0 && activeSearch ? (
            <div className="flex flex-1 flex-col items-center justify-center py-20">
              <Search className="mb-4 h-12 w-12 text-white/15" />
              <p className="text-[16px] font-semibold text-white/40">No posts found</p>
              <p className="text-[13px] text-white/25">Try different keywords or clear search</p>
            </div>
          ) : (
            columns.map((col, ci) => (
              <div key={ci} className="flex flex-1 flex-col gap-5">
                {col.map((post) => (
                  tab === 'recommended'
                    ? <PostCard key={post.id} post={post} onClick={() => setSelectedPostId(post.id)} />
                    : <TrendingPostCard key={post.id} post={post} onClick={() => setSelectedPostId(post.id)} />
                ))}
              </div>
            ))
          )}
        </motion.div>

        {tab === 'recommended' && (
          <div className="w-[280px] shrink-0 space-y-4">
            <div className="glass space-y-4 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[#4ADE80]" />
                  <span className="text-[15px] font-bold text-white/80">Tags</span>
                </div>
                <button className="rounded-full px-2.5 py-1 text-[11px] text-white/40 ring-1 ring-white/20 transition hover:text-white">more</button>
              </div>
              {trendingTags.map((tag) => (
                <div key={tag.name}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 transition ${
                    tag.active ? 'bg-[#4ADE80]/10 ring-1 ring-[#4ADE80]/20' : 'bg-white/3 hover:bg-white/5'
                  }`}>
                  <span className={`text-[13px] font-medium ${tag.active ? 'text-[#4ADE80]' : 'text-white/70'}`}>{tag.name}</span>
                  <span className="text-[11px] text-white/40">{tag.posts} posts</span>
                </div>
              ))}
            </div>

            <div className="glass space-y-3.5 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-[#FBBF24]" />
                  <span className="text-[15px] font-bold text-white/80">Top Contributors</span>
                </div>
                <button className="rounded-full px-2.5 py-1 text-[11px] text-white/40 ring-1 ring-white/20 transition hover:text-white">more</button>
              </div>
              {topContributors.map((c, i) => (
                <div key={c.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-4 text-[14px] font-bold" style={{ color: i === 0 ? '#FBBF24' : i === 1 ? '#C0C0C0' : '#CD7F32' }}>{i + 1}</span>
                    <div className={`h-7 w-7 rounded-full bg-gradient-to-br ${c.gradient}`} />
                    <span className="text-[13px] text-white/80">{c.name}</span>
                  </div>
                  <span className="text-[13px] font-bold text-[#4ADE80]">{c.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FABs — icon only with hover animation */}
      <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-3">
        <button onClick={handleRefresh}
          className="glass group flex h-12 w-12 items-center justify-center rounded-full text-white/70 transition-all duration-200 hover:scale-110 hover:bg-white/15 hover:text-white hover:shadow-[0_0_16px_rgba(255,255,255,0.15)]"
          title="Refresh">
          <RefreshCw className="h-5 w-5 transition-transform duration-300 group-hover:rotate-180" />
        </button>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="group flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#4ADE80] to-[#22D3EE] text-white transition-all duration-200 hover:scale-110 hover:shadow-[0_0_20px_rgba(74,222,128,0.4)]"
          title="Share Post">
          <Plus className="h-5 w-5 transition-transform duration-200 group-hover:rotate-90" />
        </button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedPostId && <PostModal postId={selectedPostId} onClose={() => setSelectedPostId(null)} />}
        {isCreateModalOpen && <CreatePostModal onClose={() => setIsCreateModalOpen(false)} />} {/* <--- Add this line */}
      </AnimatePresence>
    </div>
  )
}
