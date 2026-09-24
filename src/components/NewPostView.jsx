/**
 * ==============================================================================
 * NEW & EDIT ARTICLE COMPONENT (Form Handling & Validation)
 * 
 * Class Presentation Guide:
 * - [Rubric: Form Handling & Validation] Controlled inputs with submit validation
 * - [Rubric: State Management] Tracks form fields, active tab (write/preview), and errors
 * - [Rubric: Conditional Rendering] Toggles between authoring form and live preview
 * ==============================================================================
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { IconArrowLeft } from './Icons';
import { DEFAULT_CATEGORIES } from './CategoryFilter';
import { countWords, calculateReadTime } from '../utils/readingTime';

export default function NewPostView({ onSubmit, onCancel, editingPost = null }) {
  const { user } = useAuth();

  // [Rubric: Controlled Form State] Pre-populates fields if editing an existing article
  const [title, setTitle] = useState(editingPost?.title || '');
  const [category, setCategory] = useState(editingPost?.category || 'Travel');
  const [content, setContent] = useState(editingPost?.content || '');
  const [viewMode, setViewMode] = useState('write'); // 'write' | 'preview'
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Available categories excluding the 'All' filter chip
  const availableCategories = DEFAULT_CATEGORIES.filter((c) => c !== 'All');

  // Dynamic calculations for live word count and reading time
  const wordCount = countWords(content);
  const readTime = calculateReadTime(content);

  // [Rubric: Form Validation & Submission Handler]
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent standard browser page reload

    // Custom Validation checks
    if (!title.trim()) {
      setError('Please provide a title for your article.');
      return;
    }
    if (!content.trim()) {
      setError('Please provide story content.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      // Pass clean data to parent handler
      await onSubmit({
        id: editingPost?.id,
        title: title.trim(),
        category,
        content: content.trim(),
        author: editingPost ? editingPost.author : (user?.name || 'Anonymous'),
        author_id: editingPost ? editingPost.author_id : (user?.id || null),
      });
    } catch (err) {
      setError(err.message || 'Failed to save article.');
      setSubmitting(false);
    }
  };

  return (
    <div className="article-reader animate-fade-in">
      {/* Header with Title and Cancel navigation */}
      <div className="modal-header" style={{ marginBottom: '1.5rem' }}>
        <h1 className="modal-title">
          {editingPost ? 'Edit Article' : 'New Article'}
        </h1>
        <button
          className="article-back-btn"
          style={{ margin: 0 }}
          onClick={onCancel}
          type="button"
        >
          <IconArrowLeft size={15} />
          <span>Cancel</span>
        </button>
      </div>

      {/* [Rubric: Error State Handling] Display validation or submission error message */}
      {error && <div className="form-error">{error}</div>}

      {/* Mode Switcher: Write vs Live Preview */}
      <div className="editor-tab-row">
        <button
          type="button"
          className={`editor-tab-btn ${viewMode === 'write' ? 'active' : ''}`}
          onClick={() => setViewMode('write')}
        >
          Write
        </button>
        <button
          type="button"
          className={`editor-tab-btn ${viewMode === 'preview' ? 'active' : ''}`}
          onClick={() => setViewMode('preview')}
        >
          Live Preview
        </button>
      </div>

      {/* [Rubric: Conditional Rendering] Show Form or Live Preview */}
      {viewMode === 'write' ? (
        <form onSubmit={handleSubmit}>
          {/* Article Title Field */}
          <div className="form-group">
            <label className="form-label">Article Title</label>
            <input
              type="text"
              placeholder="e.g. The Quiet Joy of Sunday Cooking"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Category Dropdown */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Story Content & Live Word Counter */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Story Content</label>
              <span className="editor-counter-badge">
                {wordCount} {wordCount === 1 ? 'word' : 'words'} • {readTime}
              </span>
            </div>
            <textarea
              rows={12}
              placeholder="Write your story here... Use blank lines to create paragraphs."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              marginTop: '1.75rem',
            }}
          >
            <button
              type="button"
              className="action-pill-btn"
              onClick={onCancel}
              disabled={submitting}
            >
              Discard
            </button>
            <button
              type="submit"
              className="cta-btn"
              disabled={submitting}
            >
              {submitting
                ? 'Saving...'
                : editingPost
                ? 'Update Article'
                : 'Publish Article'}
            </button>
          </div>
        </form>
      ) : (
        /* Live Preview Mode (Renders formatted typography) */
        <div className="editor-preview-container animate-fade-in">
          <header style={{ marginBottom: '1.5rem' }}>
            <span className="post-category-tag">{category}</span>
            <h1 className="article-headline" style={{ marginTop: '0.75rem' }}>
              {title || 'Untitled Article'}
            </h1>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              By {user?.name || 'You'} • {readTime}
            </div>
          </header>

          <div className="article-body-prose">
            {content ? (
              content.split('\n\n').map((p, i) => <p key={i}>{p}</p>)
            ) : (
              <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                Your story will preview here once you start writing...
              </p>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
            <button
              type="button"
              className="action-pill-btn"
              onClick={() => setViewMode('write')}
            >
              Back to Writing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
