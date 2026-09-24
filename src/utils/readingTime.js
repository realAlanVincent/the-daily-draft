/**
 * Helper utility to calculate estimated reading time from text.
 * Average reading speed: ~200 words per minute.
 */
export function calculateReadTime(text = '') {
  if (!text) return '1 min read';
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
}

export function countWords(text = '') {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}
