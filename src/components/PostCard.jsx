/**
 * ==============================================================================
 * POST CARD COMPONENT
 * 
 * Class Presentation Guide:
 * - [Rubric: Props & Component Composition] Receives data and action callbacks via props
 * - [Rubric: Conditional Rendering] Displays Edit and Delete options only for author
 * - [Rubric: Event Handling] Uses e.stopPropagation() on buttons to avoid bubbling
 * ==============================================================================
 */

import React from 'react';
import { IconHeart, IconArrowRight, IconTrash, IconEdit, IconBookmark } from './Icons';
import { calculateReadTime } from '../utils/readingTime';

export default function PostCard({
  post,
  onOpenArticle,
  onLike,
  isLiked = false,
  isBookmarked = false,
  onToggleBookmark,
  isAuthor = false,
  onEdit,
  onDelete,
}) {
  // Format creation timestamp
  const formattedDate = post.created_at
    ? new Date(post.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : '';

  // Dynamic calculated read time
  const readTime = calculateReadTime(post.content);

  return (
    <article className="post-card">
      {/* Top Metadata Row: Category Tag, Date, Reading Time */}
      <div className="post-meta-row">
        <span className="post-category-tag">{post.category}</span>
        {formattedDate && <span className="post-date-tag">{formattedDate}</span>}
        <span className="post-dot-separator">•</span>
        <span className="post-read-time">{readTime}</span>

        {/* [Rubric: Conditional Rendering] Show Edit and Delete buttons only to post author */}
        {isAuthor && (
          <div className="post-author-actions">
            {onEdit && (
              <button
                className="icon-text-btn"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent opening the article reader
                  onEdit(post);
                }}
                title="Edit your article"
              >
                <IconEdit size={13} />
                <span>Edit</span>
              </button>
            )}
            {onDelete && (
              <button
                className="icon-text-btn delete-btn"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent opening the article reader
                  if (window.confirm(`Are you sure you want to delete "${post.title}"?`)) {
                    onDelete(post.id);
                  }
                }}
                title="Delete your article"
              >
                <IconTrash size={13} />
                <span>Delete</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Article Title: Clicking opens full Reader view */}
      <h2
        className="post-title"
        onClick={() => onOpenArticle(post.id)}
        title="Read full article"
      >
        {post.title}
      </h2>

      {/* Excerpt Summary */}
      <p className="post-excerpt">{post.excerpt}</p>

      {/* Card Footer: Author on left, Action buttons on right */}
      <div className="post-actions-bar">
        <span className="post-author">By {post.author || 'Anonymous'}</span>

        <div className="actions-cluster">
          {/* Like Button */}
          <button
            className={`action-pill-btn ${isLiked ? 'liked' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onLike(post.id);
            }}
            title={isLiked ? 'Unlike article' : 'Like article'}
            aria-label="Like article"
          >
            <IconHeart size={14} filled={isLiked} />
            <span>{post.likes || 0}</span>
          </button>

          {/* Bookmark Button (Stored in localStorage) */}
          {onToggleBookmark && (
            <button
              className={`action-pill-btn icon-only ${isBookmarked ? 'bookmarked' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(post.id);
              }}
              title={isBookmarked ? 'Remove from Bookmarks' : 'Save to Bookmarks'}
              aria-label="Bookmark article"
            >
              <IconBookmark size={13} filled={isBookmarked} />
            </button>
          )}

          {/* Read Full Article Button */}
          <button
            className="read-link"
            onClick={() => onOpenArticle(post.id)}
            title="Read full article"
          >
            <span>Read</span>
            <IconArrowRight size={13} />
          </button>
        </div>
      </div>
    </article>
  );
}
