/**
 * ==============================================================================
 * THE DAILY DRAFT - ROOT APPLICATION COMPONENT
 * 
 * Class Presentation Guide:
 * 1. Functional Components & Composition: App wraps MainApp inside AuthProvider
 * 2. React Hooks: useState (local state), useEffect (side effects), useMemo (memoized filters)
 * 3. State Management: Centralized article data, routing, likes, and local bookmarks
 * 4. API Integration: Supabase REST queries (select, insert, update, delete)
 * 5. Conditional & List Rendering: Switching between Feed, Article Reader, and Editor
 * ==============================================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabaseClient';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import CategoryFilter from './components/CategoryFilter';
import PostCard from './components/PostCard';
import ArticleReader from './components/ArticleReader';
import NewPostView from './components/NewPostView';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';

// ------------------------------------------------------------------------------
// 1. Root Component (Component Composition & Context Provider)
// ------------------------------------------------------------------------------
export default function App() {
  return (
    // [Rubric: Context API] Wraps the entire application to provide user auth state globally
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

function MainApp() {
  // [Rubric: Context Hook] Consume user authentication state and methods
  const { user, isAuthenticated } = useAuth();

  // ----------------------------------------------------------------------------
  // 2. Navigation & Routing State — synced with the browser URL via History API
  //    URL scheme: / → feed | /article/:id → reader | /write → editor
  // ----------------------------------------------------------------------------
  const parseCurrentPath = () => {
    const path = window.location.pathname;
    const articleMatch = path.match(/^\/article\/(\d+)/);
    if (articleMatch) return { view: 'article', articleId: Number(articleMatch[1]) };
    if (path === '/write') return { view: 'new-post', articleId: null };
    return { view: 'feed', articleId: null };
  };

  const initialRoute = parseCurrentPath();
  const [currentView, setCurrentView] = useState(initialRoute.view);
  const [selectedArticleId, setSelectedArticleId] = useState(initialRoute.articleId);
  const [editingPost, setEditingPost] = useState(null);

  // [Rubric: React Hook - useEffect] Sync browser URL whenever the view changes
  const navigateTo = (view, articleId = null, replace = false) => {
    const path =
      view === 'article' && articleId ? `/article/${articleId}` :
      view === 'new-post' ? '/write' : '/';
    if (replace) {
      window.history.replaceState({ view, articleId }, '', path);
    } else {
      window.history.pushState({ view, articleId }, '', path);
    }
    setCurrentView(view);
    setSelectedArticleId(articleId);
  };

  // Handle browser Back / Forward buttons
  useEffect(() => {
    const onPopState = (e) => {
      const state = e.state;
      if (state && state.view) {
        setCurrentView(state.view);
        setSelectedArticleId(state.articleId || null);
        setEditingPost(null);
      } else {
        const route = parseCurrentPath();
        setCurrentView(route.view);
        setSelectedArticleId(route.articleId);
        setEditingPost(null);
      }
    };
    window.addEventListener('popstate', onPopState);
    // Stamp the initial history entry so Back always works
    window.history.replaceState({ view: initialRoute.view, articleId: initialRoute.articleId }, '', window.location.pathname);
    return () => window.removeEventListener('popstate', onPopState);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------------------------------------------
  // 3. Search, Filter & Sort State
  // ----------------------------------------------------------------------------
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest'); // 'latest' | 'popular'

  // ----------------------------------------------------------------------------
  // 4. Persistent Bookmarks State (Using Browser localStorage)
  // ----------------------------------------------------------------------------
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem('tdd_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // ----------------------------------------------------------------------------
  // 5. Data & Like State Management
  // ----------------------------------------------------------------------------
  const [posts, setPosts] = useState([]);
  const [userLikes, setUserLikes] = useState(new Set());
  const [loading, setLoading] = useState(false); // [Rubric: Loading State]

  // ----------------------------------------------------------------------------
  // 6. UI & Notification State
  // ----------------------------------------------------------------------------
  const [theme, setTheme] = useState(() => localStorage.getItem('tdd_theme') || 'light');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authNotice, setAuthNotice] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Helper function to trigger non-intrusive toast messages
  const showToast = (msg) => {
    setToastMessage(msg);
  };

  // [Rubric: React Hook - useEffect] Auto-dismiss toast notification after 3.2 seconds
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(''), 3200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // [Rubric: React Hook - useEffect] Sync theme attribute on document root (Static black 'd' favicon)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tdd_theme', theme);
  }, [theme]);

  // ----------------------------------------------------------------------------
  // 7. API Integration: Fetch Articles from Supabase Database
  // ----------------------------------------------------------------------------
  const fetchPosts = async () => {
    setLoading(true);
    try {
      // [Rubric: API Integration] Fetch posts ordered chronologically
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPosts(data);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false); // [Rubric: Loading State completion]
    }
  };

  // Load articles once on initial component mount
  useEffect(() => {
    fetchPosts();
  }, []);

  // ----------------------------------------------------------------------------
  // 8. API Integration: Fetch User Likes from Supabase 'likes' Table
  // ----------------------------------------------------------------------------
  useEffect(() => {
    async function fetchUserLikes() {
      if (!user) {
        setUserLikes(new Set());
        return;
      }

      try {
        // Query only likes belonging to the currently authenticated user
        const { data, error } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user.id);

        if (!error && data) {
          const likedIds = new Set(data.map((item) => Number(item.post_id)));
          setUserLikes(likedIds);
        }
      } catch (err) {
        console.warn('Error fetching likes:', err);
      }
    }

    fetchUserLikes();
  }, [user]);

  // ----------------------------------------------------------------------------
  // 9. Bookmark Action Handler (Saves list directly in browser localStorage)
  // ----------------------------------------------------------------------------
  const handleToggleBookmark = (postId) => {
    setBookmarks((prev) => {
      const isAlreadyBookmarked = prev.includes(postId);
      const updated = isAlreadyBookmarked
        ? prev.filter((id) => id !== postId)
        : [...prev, postId];

      localStorage.setItem('tdd_bookmarks', JSON.stringify(updated));
      showToast(isAlreadyBookmarked ? 'Removed from Bookmarks' : 'Saved to Bookmarks');
      return updated;
    });
  };

  // ----------------------------------------------------------------------------
  // 10. Like / Unlike Handler (Strictly requires authentication)
  // ----------------------------------------------------------------------------
  const handleLike = async (postId) => {
    // [Rubric: Form & Security Validation] Prevent unauthenticated users from liking
    if (!isAuthenticated || !user) {
      setAuthNotice('Please sign in to like articles.');
      setIsAuthModalOpen(true);
      return;
    }

    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const isAlreadyLiked = userLikes.has(postId);
    const updatedLikesCount = isAlreadyLiked
      ? Math.max(0, (post.likes || 0) - 1)
      : (post.likes || 0) + 1;

    // Optimistic UI Update (immediate feedback for better UX)
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: updatedLikesCount } : p))
    );

    setUserLikes((prev) => {
      const next = new Set(prev);
      if (isAlreadyLiked) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });

    if (!isAlreadyLiked) {
      showToast('Liked article!');
    }

    // [Rubric: API Integration] Persist like toggle to Supabase database
    try {
      if (isAlreadyLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        await supabase.from('likes').insert({
          post_id: postId,
          user_id: user.id,
        });
      }

      await supabase
        .from('posts')
        .update({ likes: updatedLikesCount })
        .eq('id', postId);
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  // ----------------------------------------------------------------------------
  // 11. Create & Update Article Handler (Author Ownership)
  // ----------------------------------------------------------------------------
  const handleSavePost = async (postData) => {
    const excerpt = postData.excerpt || postData.content.slice(0, 130) + '...';

    if (postData.id) {
      // UPDATE: Modifies existing article in Supabase
      const { data, error } = await supabase
        .from('posts')
        .update({
          title: postData.title,
          category: postData.category,
          content: postData.content,
          excerpt,
        })
        .eq('id', postData.id)
        .select()
        .single();

      if (!error && data) {
        setPosts((prev) => prev.map((p) => (p.id === data.id ? data : p)));
        showToast('Article updated successfully!');
      }
    } else {
      // INSERT: Creates new article in Supabase
      const { data, error } = await supabase
        .from('posts')
        .insert({
          title: postData.title,
          category: postData.category,
          content: postData.content,
          excerpt,
          author: postData.author || user?.name || 'Anonymous',
          author_id: user?.id || null,
          likes: 0,
        })
        .select()
        .single();

      if (!error && data) {
        setPosts((prev) => [data, ...prev]);
        showToast('Article published successfully!');
      }
    }

    setEditingPost(null);
    navigateTo('feed');
  };

  // ----------------------------------------------------------------------------
  // 12. Delete Article Handler (Author Ownership)
  // ----------------------------------------------------------------------------
  const handleDeletePost = async (postId) => {
    try {
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (!error) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        showToast('Article deleted.');
        if (selectedArticleId === postId) {
          navigateTo('feed');
        }
      }
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  // Trigger editing mode with pre-populated values
  const handleEditPost = (post) => {
    setEditingPost(post);
    navigateTo('new-post');
  };

  // Helper check: does the logged-in user own this post?
  const isPostAuthor = (post) => {
    if (!user || !post) return false;
    if (post.author_id && post.author_id === user.id) return true;
    return post.author.toLowerCase() === user.name.toLowerCase();
  };

  // ----------------------------------------------------------------------------
  // 13. [Rubric: useMemo] Filter & Sort Optimization
  // Calculates filtered and sorted posts only when dependencies change
  // ----------------------------------------------------------------------------
  const processedPosts = useMemo(() => {
    let result = [...posts];

    // Filter by Category or Bookmarks tab
    if (selectedCategory === 'Bookmarks') {
      result = result.filter((p) => bookmarks.includes(p.id));
    } else if (selectedCategory !== 'All') {
      result = result.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Keyword Search across title, content, and author
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.author.toLowerCase().includes(q)
      );
    }

    // Sorting by Latest (date) or Popular (likes)
    if (sortBy === 'popular') {
      result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return result;
  }, [posts, selectedCategory, searchQuery, sortBy, bookmarks]);

  // Find article for reader view
  const activeArticle = useMemo(
    () => posts.find((p) => p.id === selectedArticleId),
    [posts, selectedArticleId]
  );

  // ----------------------------------------------------------------------------
  // 14. [Rubric: Component Composition & Conditional Rendering] View Rendering
  // ----------------------------------------------------------------------------
  return (
    <div className="app-container">
      {/* Top Navigation Bar Component */}
      <Navbar
        currentTheme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        onNavigateFeed={() => {
          navigateTo('feed');
          setEditingPost(null);
        }}
        onNavigateWrite={() => {
          setEditingPost(null);
          navigateTo('new-post');
        }}
        onOpenAuth={(notice = '') => {
          setAuthNotice(notice);
          setIsAuthModalOpen(true);
        }}
      />

      {/* Main Dynamic View Container */}
      <main className="content-container">
        {/* VIEW 1: Feed View (Conditional Rendering) */}
        {currentView === 'feed' && (
          <div className="animate-fade-in">
            {/* Filter, Search & Sort Component */}
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              bookmarksCount={bookmarks.length}
            />

            {/* [Rubric: Conditional Rendering for Loading & Empty States] */}
            {loading ? (
              <div className="empty-state">
                <p>Loading articles...</p>
              </div>
            ) : processedPosts.length === 0 ? (
              <div className="empty-state">
                <h3>
                  {selectedCategory === 'Bookmarks'
                    ? 'No saved bookmarks yet'
                    : 'No articles found'}
                </h3>
                <p style={{ margin: '0.5rem auto 1.5rem', color: 'var(--text-secondary)' }}>
                  {selectedCategory === 'Bookmarks'
                    ? 'Click the bookmark icon on any story to save it for reading later.'
                    : searchQuery
                    ? `No matches for "${searchQuery}". Try different keywords.`
                    : 'Be the first to publish a story.'}
                </p>
                {selectedCategory === 'Bookmarks' ? (
                  <button
                    className="action-pill-btn"
                    onClick={() => setSelectedCategory('All')}
                  >
                    Browse All Articles
                  </button>
                ) : searchQuery ? (
                  <button className="action-pill-btn" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </button>
                ) : (
                  <button className="cta-btn" onClick={() => navigateTo('new-post')}>
                    Write an Article
                  </button>
                )}
              </div>
            ) : (
              // [Rubric: List Rendering] Map through articles and render PostCard components
              <div className="posts-list">
                {processedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    isLiked={userLikes.has(post.id)}
                    isBookmarked={bookmarks.includes(post.id)}
                    onToggleBookmark={handleToggleBookmark}
                    isAuthor={isPostAuthor(post)}
                    onOpenArticle={(id) => {
                      navigateTo('article', id);
                    }}
                    onLike={handleLike}
                    onEdit={handleEditPost}
                    onDelete={handleDeletePost}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: Full Article Reader (Conditional Rendering) */}
        {currentView === 'article' && activeArticle && (
          <ArticleReader
            article={activeArticle}
            isLiked={userLikes.has(activeArticle.id)}
            isBookmarked={bookmarks.includes(activeArticle.id)}
            onToggleBookmark={() => handleToggleBookmark(activeArticle.id)}
            isAuthor={isPostAuthor(activeArticle)}
            onBack={() => {
              navigateTo('feed');
            }}
            onLike={() => handleLike(activeArticle.id)}
            onEdit={handleEditPost}
            onDelete={handleDeletePost}
            onOpenAuth={(notice = '') => {
              setAuthNotice(notice);
              setIsAuthModalOpen(true);
            }}
            onShowToast={showToast}
          />
        )}
        {/* Fallback: URL points to an article but posts haven't loaded yet */}
        {currentView === 'article' && !activeArticle && (
          <div className="empty-state">
            <p>{loading ? 'Loading article...' : 'Article not found.'}</p>
          </div>
        )}

        {/* VIEW 3: Create & Edit Article View (Conditional Rendering) */}
        {currentView === 'new-post' && (
          <NewPostView
            editingPost={editingPost}
            onSubmit={handleSavePost}
            onCancel={() => {
              setEditingPost(null);
              navigateTo('feed');
            }}
          />
        )}
      </main>

      {/* Semantic Footer */}
      <footer className="site-footer">
        <div>
          The Daily Draft © {new Date().getFullYear()} — An independent publication on travel, cooking, lifestyle, and thought.
        </div>
      </footer>

      {/* Authentication Modal Dialog */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialNotice={authNotice}
      />

      {/* Non-intrusive Toast Feedback */}
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </div>
  );
}
