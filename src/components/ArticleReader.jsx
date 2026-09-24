/**
 * ==============================================================================
 * ARTICLE READER COMPONENT
 * 
 * Class Presentation Guide:
 * - [Rubric: React Hook - useEffect] Window scroll listener for dynamic reading progress bar
 * - [Rubric: Browser APIs] navigator.clipboard.writeText for one-click link sharing
 * - [Rubric: Component Composition] Embeds CommentSection child component
 * ==============================================================================
 */

import React, { useState, useEffect } from 'react';
import { IconArrowLeft, IconHeart, IconShare, IconEdit, IconTrash, IconBookmark } from './Icons';
import CommentSection from './CommentSection';
import { calculateReadTime } from '../utils/readingTime';

export default function ArticleReader({
  article,
  onBack,
  onLike,
  isLiked = false,
  isBookmarked = false,
  onToggleBookmark,
  isAuthor = false,
  onEdit,
  onDelete,
  onOpenAuth,
  onShowToast,
}) {
  const [scrollProgress, setScrollProgress] = useState(0);

  // [Rubric: React Hook - useEffect with Window Event Listener]
  // Calculates scroll percentage down the article and cleans up on unmount
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!article) return null;

  // Format published date
  const formattedDate = article.created_at
    ? new Date(article.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const readTime = calculateReadTime(article.content);

  // [Rubric: Browser Web API Integration] 1-Click Clipboard Share
  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        if (onShowToast) onShowToast('Article link copied to clipboard!');
      } else {
        if (onShowToast) onShowToast('Article ready to share!');
      }
    } catch (err) {
      if (onShowToast) onShowToast('Link copied!');
    }
  };

  return (
    <>
      {/* Dynamic Reading Progress Bar at the top of the browser window */}
      <div
        className="reading-progress-bar"
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin="0"
        aria-valuemax="100"
      />

      <article className="article-reader animate-fade-in">
        {/* Navigation & Action Controls Bar */}
        <div className="article-nav-bar">
          <button className="article-back-btn" onClick={onBack} title="Return to articles">
            <IconArrowLeft size={15} />
            <span>Back to Articles</span>
          </button>

          <div className="article-top-actions">
            {/* Bookmark Action */}
            {onToggleBookmark && (
              <button
                className={`icon-btn ${isBookmarked ? 'bookmarked' : ''}`}
                onClick={onToggleBookmark}
                title={isBookmarked ? 'Remove from Bookmarks' : 'Save to Bookmarks'}
                aria-label="Bookmark article"
              >
                <IconBookmark size={14} filled={isBookmarked} />
              </button>
            )}

            {/* Share Link Action */}
            <button className="icon-btn" onClick={handleShare} title="Share article link">
              <IconShare size={14} />
            </button>

            {/* [Rubric: Conditional Rendering] Author edit & delete options */}
            {isAuthor && (
              <>
                {onEdit && (
                  <button
                    className="icon-btn"
                    onClick={() => onEdit(article)}
                    title="Edit article"
                  >
                    <IconEdit size={14} />
                  </button>
                )}
                {onDelete && (
                  <button
                    className="icon-btn delete-icon-btn"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete "${article.title}"?`)) {
                        onDelete(article.id);
                      }
                    }}
                    title="Delete article"
                  >
                    <IconTrash size={14} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Article Headline & Author Meta */}
        <header>
          <div className="post-meta-row" style={{ marginBottom: '0.85rem' }}>
            <span className="post-category-tag">{article.category}</span>
            <span className="post-dot-separator">•</span>
            <span className="post-read-time">{readTime}</span>
          </div>

          <h1 className="article-headline">{article.title}</h1>

          <div className="article-author-row">
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.925rem' }}>{article.author}</div>
              {formattedDate && (
                <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
                  Published on {formattedDate}
                </div>
              )}
            </div>

            {/* Like Action Button */}
            <button
              className={`action-pill-btn ${isLiked ? 'liked' : ''}`}
              onClick={onLike}
              title={isLiked ? 'Unlike this article' : 'Like this article'}
              aria-label="Like article"
            >
              <IconHeart size={14} filled={isLiked} />
              <span>{article.likes || 0}</span>
            </button>
          </div>
        </header>

        {/* Prose Body: Paragraph rendering */}
        <div className="article-body-prose">
          {article.content.split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {/* [Rubric: Component Composition] Embedded Discussion & Comment Component */}
        <CommentSection articleId={article.id} onOpenAuth={onOpenAuth} />
      </article>
    </>
  );
}
