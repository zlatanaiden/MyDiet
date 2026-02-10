# 🥗 MyDiet — 智能个性化饮食管理系统

<p align="center">
  <img src="前端/public/vite.svg" alt="MyDiet Logo" width="60" />
</p>

<p align="center">
  <strong>基于 AI 的个性化饮食规划 · 营养追踪 · 社区互动</strong>
</p>

<p align="center">
  <a href="https://2026-comp-208-group-47.vercel.app">🌐 在线体验 Live Demo</a>
</p>

---

## 📖 项目简介

**MyDiet** 是一款面向健康饮食管理的 Web 应用，旨在根据用户的身体数据、饮食目标和个人偏好，提供个性化的一周三餐规划，并通过营养追踪和社区互动帮助用户养成健康的饮食习惯。

### 核心功能

- **个性化饮食规划** — 根据用户目标（减脂/增重/维持）自动生成一周三餐方案
- **每日营养追踪** — 实时展示热量、蛋白质、碳水、脂肪摄入进度
- **AI 食物识别** — 上传食物照片，自动识别并记录营养数据
- **社区互动** — 分享饮食心得、浏览健康食谱、与其他用户交流
- **打卡激励** — 连续打卡天数追踪，激发坚持动力

---

## 🖥️ 页面概览

| 页面 | 说明 |
|------|------|
| **Landing Page (0-0)** | 产品宣传页，展示核心功能、定价方案和用户评价 |
| **Login (0-1)** | 用户登录页 |
| **Signup (0-2)** | 用户注册页 |
| **Homepage (1-1)** | 首页仪表盘 — 日历、营养环形进度条、今日三餐、额外餐食 |
| **Plan Questionnaire (2-1)** | 个人信息填写 — 目标、身高、体重、过敏源等 |
| **Plan Dashboard (2-2)** | 一周智能饮食规划 — 含个人状态、目标、限制条件管理 |
| **Plan Day Detail (2-3)** | 每日三餐详情及备选方案 |
| **Identifier Upload (3-1)** | 食物照片上传/拖拽页面 |
| **Identifier Results (3-2)** | AI 识别结果展示及确认 |
| **Community Recommended (4-1)** | 社区推荐内容、标签筛选、热门贡献者 |
| **Community Post Detail (4-2)** | 帖子详情模态框 — 评论、点赞、楼中楼回复 |
| **Community Trending (4-3)** | 24 小时热门帖子 |
| **Profile (5-1)** | 个人资料 — 健康指标、身体成分历史图表、隐私设置 |

---

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| **框架** | React 19 + TypeScript |
| **构建工具** | Vite 6 |
| **样式** | Tailwind CSS v4（玻璃拟态风格） |
| **路由** | React Router v7 |
| **状态管理** | React Context API + localStorage 持久化 |
| **动画** | Framer Motion |
| **图表** | Recharts |
| **图标** | Lucide React |
| **特效** | Canvas Confetti（打卡礼花动画） |

---

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18
- **npm** >= 9

### 安装与运行

```bash
# 1. 克隆仓库
git clone https://github.com/NameFar/2026_COMP208_GROUP47.git

# 2. 进入前端项目目录
cd 2026_COMP208_GROUP47/前端

# 3. 安装依赖
npm install

# 4. 启动开发服务器
npm run dev
```

启动后访问 `http://localhost:5173` 即可查看项目。

### 构建生产版本

```bash
npm run build
```

构建产物位于 `dist/` 目录。

---

## 📁 项目结构

```
前端/
├── public/                  # 静态资源
├── src/
│   ├── components/
│   │   └── layout/
│   │       ├── Layout.tsx   # 页面布局（含 Navbar）
│   │       └── Navbar.tsx   # 顶部导航栏
│   ├── context/
│   │   └── AppContext.tsx   # 全局状态管理（用户、营养、社区等）
│   ├── data/
│   │   └── mockData.ts     # 模拟数据（餐食、社区帖子等）
│   ├── pages/
│   │   ├── LandingPage.tsx  # 宣传页 (0-0)
│   │   ├── LoginPage.tsx    # 登录页 (0-1)
│   │   ├── SignupPage.tsx   # 注册页 (0-2)
│   │   ├── Homepage.tsx     # 首页 (1-1)
│   │   ├── PlanPage.tsx     # 饮食规划 (2-1 / 2-2)
│   │   ├── PlanDayDetail.tsx# 日详细 (2-3)
│   │   ├── Identifier.tsx   # 食物识别 (3-1 / 3-2)
│   │   ├── Community.tsx    # 社区 (4-1 / 4-2 / 4-3)
│   │   └── Profile.tsx      # 个人资料 (5-1)
│   ├── App.tsx              # 路由配置与鉴权
│   ├── main.tsx             # 应用入口
│   └── index.css            # 全局样式（玻璃拟态、渐变）
├── index.html               # HTML 模板
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## ✨ 主要交互特性

- **🔥 打卡系统** — 点击火焰图标触发燃烧特效，连续打卡天数递增
- **🎉 用餐确认** — 完成用餐后点击 ✅，触发礼花动画，营养进度条动态增长
- **📅 日历回溯** — 点击历史日期查看往日饮食记录
- **🔄 智能换菜** — 对推荐菜品不满意可一键替换相似营养的替代品
- **📷 AI 识别** — 拖拽/上传食物照片，自动识别并录入营养数据
- **❤️ 双击点赞** — 社区帖子支持双击触发红心动画
- **💬 楼中楼评论** — 支持嵌套回复的评论系统
- **🔍 社区搜索** — 关键词检索帖子，支持 Enter 快捷搜索
- **📊 数据可视化** — 30 天体重/体脂变化趋势折线图
- **🔒 隐私控制** — 可选择是否公开饮食目标和食谱

---

## 🎨 设计风格

采用 **玻璃拟态（Glassmorphism）** 设计风格：

- 深色渐变背景（`#0F0C29` → `#302B63` → `#24243E`）
- 半透明毛玻璃卡片（`backdrop-blur`）
- 品牌色渐变（绿色 `#10B981` → 青色 `#06B6D4`）
- 流畅的 Framer Motion 过渡动画

---

## 📄 License

MIT License

---

<p align="center">
  Made with ❤️ by COMP208 Group 47
</p>
