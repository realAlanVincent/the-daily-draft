/**
 * ==============================================================================
 * COMMENT & DISCUSSION COMPONENT
 * 
 * Class Presentation Guide:
 * - [Rubric: API Integration] Queries Supabase comments by article ID
 * - [Rubric: List Rendering] Iterates through comments with unique React keys
 * - [Rubric: Conditional Rendering] Shows reply form to logged-in users or prompt to visitors
 * - [Rubric: Form Handling] Submits new comments and updates local list state
 * ==============================================================================
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function CommentSection({ articleId, onOpenAuth }) {
  // [Rubric: Context Hook] Access active user information
  const { user, isAuthenticated } = useAuth();

  // Component State
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // [Rubric: React Hook - useEffect & API Integration] Fetch comments for this specific article
  useEffect(() => {
    let isCurrent = true;

    async function fetchComments() {
      try {
        const { data, error } = await supabase
          .from('comments')
          .select('*')
          .eq('post_id', articleId)
          .order('created_at', { ascending: true });

        if (!error && data && isCurrent) {
          setComments(data);
        }
      } catch (err) {
        console.error('Error fetching comments:', err);
      }
    }

    if (articleId) {
      fetchComments();
    }

    return () => {
      isCurrent = false;
    };
  }, [articleId]);

  // [Rubric: Form Handling & API Insertion] Add new comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated || !user) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: articleId,
          author: user.name,
          author_id: user.id,
          content: newComment.trim(),
        })
        .select()
        .single();

      if (!error && data) {
        // Append newly created comment to state
        setComments((prev) => [...prev, data]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="comments-wrapper">
      <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem' }}>
        Discussion ({comments.length})
      </h3>

      {/* [Rubric: Conditional Rendering] Reply Form vs Sign-In Prompt */}
      {isAuthenticated ? (
        <form onSubmit={handleAddComment} className="comment-form">
          <input
            type="text"
            className="comment-input"
            placeholder={`Reply as ${user.name}...`}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            required
          />
          <button
            type="submit"
            className="cta-btn"
            style={{ padding: '0 1rem', height: '36px' }}
            disabled={submitting}
          >
            {submitting ? '...' : 'Post'}
          </button>
        </form>
      ) : (
        <div className="comment-signin-prompt">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Join the conversation.
          </span>
          <button
            type="button"
            className="action-pill-btn"
            onClick={() => onOpenAuth('Please sign in to join the discussion.')}
            style={{ fontWeight: 600 }}
          >
            Sign In to Comment
          </button>
        </div>
      )}

      {/* [Rubric: List Rendering & Empty State Handling] */}
      <div className="comments-list" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {comments.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            No comments yet. Start the conversation.
          </p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="comment-bubble">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.825rem' }}>{c.author}</span>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                  {c.created_at ? new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                </span>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                {c.content}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
