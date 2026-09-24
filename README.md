# The Daily Draft — Clean Editorial Publication

> **An independent digital publication built with React, Vite, Supabase, and browser `localStorage`, featuring a minimalist monochrome design system.**

---

## 📋 Course Rubric & Technical Requirement Compliance

Every requirement specified in your teacher's syllabus is thoroughly implemented and mapped below:

| # | Teacher's Requirement | Implementation & Architectural Evidence | Code Location |
| :--- | :--- | :--- | :--- |
| **1** | **Functional components & composition** | Clean component hierarchy: `App` composes `Navbar`, `CategoryFilter`, `PostCard`, `ArticleReader`, `NewPostView`, `AuthModal`, and `Toast`. `ArticleReader` composes `CommentSection`. | [`src/App.jsx`](file:///c:/Users/Alan%20Vincent/Documents/the-daily-draft/src/App.jsx), [`src/components/`](file:///c:/Users/Alan%20Vincent/Documents/the-daily-draft/src/components/) |
| **2** | **Props and state management** | Unidirectional data flow passing props (`post`, `bookmarks`, `likes`, `comments`, callback handlers) down component trees. Component state synchronized across views. | [`src/components/PostCard.jsx`](file:///c:/Users/Alan%20Vincent/Documents/the-daily-draft/src/components/PostCard.jsx), [`src/App.jsx`](file:///c:/Users/Alan%20Vincent/Documents/the-daily-draft/src/App.jsx) |
| **3** | **React Hooks** | Core hooks utilized throughout: `useState` (forms, active route, modals, search), `useEffect` (data fetching, `localStorage` bookmark sync, reading progress scroll listener), `useContext` (`useAuth`), and `useMemo` (live search, category filtering, bookmark filtering, sorting). | [`src/App.jsx`](file:///c:/Users/Alan%20Vincent/Documents/the-daily-draft/src/App.jsx), [`src/components/ArticleReader.jsx`](file:///c:/Users/Alan%20Vincent/Documents/the-daily-draft/src/components/ArticleReader.jsx) |
| **4** | **Form handling and validation** | Controlled input forms with validation for creating articles (`NewPostView`), posting comments (`CommentSection`), and user authentication (`AuthModal`). Includes required field checks, whitespace trimming, and error feedback. | [`src/components/NewPostView.jsx`](file:///c:/Users/Alan%20Vincent/Documents/the-daily-draft/src/components/NewPostView.jsx), [`src/components/CommentSection.jsx`](file:///c:/Users/Alan%20Vincent/Documents/the-daily-draft/src/components/CommentSection.jsx), [`src/components/AuthModal.jsx`](file:///c:/Users/Alan%20Vincent/Documents/the-daily-draft/src/components/AuthModal.jsx) |
| **5** | **Conditional and list rendering** | Dynamic array rendering using `.map()` with unique keys (`posts.map`, `categories.map`, `comments.map`). Conditional rendering for route views, empty states, loading skeletons/spinners, and author-specific actions (`post.user_id === user.id`). | [`src/App.jsx`](file:///c:/Users/Alan%20Vincent/Documents/the-daily-draft/src/App.jsx), [`src/components/CommentSection.jsx`](file:///c:/Users/Alan%20Vincent/Documents/the-daily-draft/src/components/CommentSection.jsx) |
| **6** | **API integration and data fetching** | Relational Supabase client queries for `posts` (with joined `profiles`), `likes` (with user foreign keys), and `comments` with referential integrity. Includes fallback seed data for offline resilience. | [`src/App.jsx`](file:///c:/Users/Alan%20Vincent/Documents/the-daily-draft/src/App.jsx), [`src/supabaseClient.js`](file:///c:/Users/Alan%20Vincent/Documents/the-daily-draft/src/supabaseClient.js) |
| **7** | **Routing and navigation** | Lightweight client-side view router switching between `feed`, `article` (deep reader mode), and `new-post`. Includes breadcrumbs, back buttons, and dynamic document title updating. | [`src/App.jsx`](file:///c:/Users/Alan%20Vincent/Documents/the-daily-draft/src/App.jsx) |
| **8** | **Context API & state management** | Global `AuthContext` with custom `useAuth()` hook managing session, profile, and auth methods. Decoupled browser `localStorage` state for saved bookmark persistence. | [`src/context/AuthContext.jsx`](file:///c:/Users/Alan%20Vincent/Documents/the-daily-draft/src/context/AuthContext.jsx) |
| **9** | **Responsive & user-friendly design** | Fully responsive layout adapting seamlessly from mobile (<640px) to desktop. Sticky glassmorphism header, reading progress bar, floating toast feedback, and high-readability typography. | [`src/index.css`](file:///c:/Users/Alan%20Vincent/Documents/the-daily-draft/src/index.css) |
| **10** | **Appropriate styling techniques** | Vanilla CSS design system using CSS Custom Properties (`--bg-app`, `--text-primary`, `--border-subtle`, `--accent`) for instant high-contrast Dark and Light mode switching. Clean inline SVG icons. | [`src/index.css`](file:///c:/Users/Alan%20Vincent/Documents/the-daily-draft/src/index.css), [`src/components/Icons.jsx`](file:///c:/Users/Alan%20Vincent/Documents/the-daily-draft/src/components/Icons.jsx) |
| **11** | **Error and loading state handling** | Loading spinners, button disabling during submissions (`Posting...`, `Publishing...`), error alert banners, toast notifications, and optimistic UI rollback on network failures. | [`src/App.jsx`](file:///c:/Users/Alan%20Vincent/Documents/the-daily-draft/src/App.jsx), [`src/components/Toast.jsx`](file:///c:/Users/Alan%20Vincent/Documents/the-daily-draft/src/components/Toast.jsx) |

---

## 📁 Project Structure

```text
the-daily-draft/
├── .env                  # Supabase environment variables (URL + Anon Key)
├── .env.example          # Environment template
├── .gitignore            # Git ignore rules
├── index.html            # HTML shell with static SVG favicon
├── package.json          # Project dependencies & scripts
├── README.md             # Project documentation & rubric mapping
├── supabase_schema.sql   # Complete Supabase schema, triggers & seed data
├── vite.config.js        # Vite build configuration
└── src/
    ├── main.jsx          # React DOM entry point wrapping AuthProvider
    ├── App.jsx           # Main publication layout, router & state orchestrator
    ├── index.css         # Complete vanilla CSS design system & dark/light themes
    ├── supabaseClient.js # Supabase SDK client initialization
    ├── components/
    │   ├── ArticleReader.jsx   # Deep reading view with reading progress bar
    │   ├── AuthModal.jsx       # Email & password login / registration modal
    │   ├── CategoryFilter.jsx  # Category pills & Saved bookmarks filter chip
    │   ├── CommentSection.jsx  # Article discussion thread & new comment form
    │   ├── Icons.jsx           # Reusable SVG icon library
    │   ├── Navbar.jsx          # Header with logo, search, write & profile menu
    │   ├── NewPostView.jsx     # Editor with live word counter & live preview tab
    │   ├── PostCard.jsx        # Article preview card with likes & bookmarks
    │   └── Toast.jsx           # Floating action toast notifications
    ├── context/
    │   └── AuthContext.jsx     # Supabase authentication Context & useAuth hook
    └── utils/
        └── readingTime.js      # Reading time calculation utility
```

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Launch development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.
