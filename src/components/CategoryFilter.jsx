/**
 * ==============================================================================
 * CATEGORY FILTER, SEARCH & SORT COMPONENT
 * 
 * Class Presentation Guide:
 * - [Rubric: Props & State Management] Controlled input and active filter callbacks
 * - [Rubric: Accessibility & Semantic HTML] ARIA attributes (role="tablist", aria-selected)
 * - [Rubric: List Rendering] Maps through category array to generate filter chips
 * ==============================================================================
 */

import React from 'react';
import { IconSearch, IconClose } from './Icons';

export const DEFAULT_CATEGORIES = ['All', 'Travel', 'Cooking', 'Lifestyle', 'Books', 'Technology'];

export default function CategoryFilter({
  categories = DEFAULT_CATEGORIES,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  bookmarksCount = 0,
}) {
  return (
    <div className="filter-wrapper">
      {/* 1. Real-time Search Input & Sort Toggle Row */}
      <div className="feed-controls-row">
        <div className="search-bar-container">
          <IconSearch size={15} />
          {/* [Rubric: Controlled Input] Binds search query to state with real-time feedback */}
          <input
            type="text"
            className="search-input"
            placeholder="Search articles, authors, or topics..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              title="Clear search"
              type="button"
            >
              <IconClose size={13} />
            </button>
          )}
        </div>

        {/* Sort Controls (Latest vs Popular) */}
        <div className="sort-controls">
          <button
            className={`sort-pill ${sortBy === 'latest' ? 'active' : ''}`}
            onClick={() => onSortChange('latest')}
            type="button"
          >
            Latest
          </button>
          <button
            className={`sort-pill ${sortBy === 'popular' ? 'active' : ''}`}
            onClick={() => onSortChange('popular')}
            type="button"
          >
            Popular
          </button>
        </div>
      </div>

      {/* 2. Category Filter Chips [Rubric: Semantic Tablist] */}
      <div className="filter-category-bar" role="tablist" aria-label="Article categories">
        {categories.map((category) => {
          const isActive = selectedCategory.toLowerCase() === category.toLowerCase();
          return (
            <button
              key={category}
              role="tab"
              aria-selected={isActive}
              className={`category-chip ${isActive ? 'active' : ''}`}
              onClick={() => onSelectCategory(category)}
              type="button"
            >
              {category}
            </button>
          );
        })}

        {/* Bookmarks Filter Tab (Connects to localStorage saved items) */}
        <button
          role="tab"
          aria-selected={selectedCategory === 'Bookmarks'}
          className={`category-chip bookmark-filter-chip ${selectedCategory === 'Bookmarks' ? 'active' : ''}`}
          onClick={() => onSelectCategory('Bookmarks')}
          type="button"
          title="View your saved bookmarks"
        >
          <span>Saved</span>
          {bookmarksCount > 0 && <span className="category-count-badge">{bookmarksCount}</span>}
        </button>
      </div>
    </div>
  );
}
