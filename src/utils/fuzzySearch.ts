/**
 * Fuzzy search utilities for product search
 * Handles typos, partial matches, and similarity scoring
 */

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching (e.g., "hodie" matches "hoodie")
 */
export const levenshteinDistance = (str1: string, str2: string): number => {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = [];

  // Initialize DP table
  for (let i = 0; i <= m; i++) {
    dp[i] = [i];
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  // Fill DP table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,      // deletion
          dp[i][j - 1] + 1,      // insertion
          dp[i - 1][j - 1] + 1   // substitution
        );
      }
    }
  }

  return dp[m][n];
};

/**
 * Calculate similarity score between two strings (0-1, where 1 is identical)
 */
export const similarityScore = (str1: string, str2: string): number => {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;
  
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return 1 - distance / maxLen;
};

/**
 * Check if search query matches text with fuzzy matching
 */
export const fuzzyMatch = (
  query: string,
  text: string,
  threshold: number = 0.6
): boolean => {
  const queryLower = query.toLowerCase().trim();
  const textLower = text.toLowerCase().trim();

  // Exact match
  if (textLower.includes(queryLower)) {
    return true;
  }

  // Check if query is a substring (handles partial words)
  if (queryLower.length >= 3 && textLower.includes(queryLower)) {
    return true;
  }

  // Fuzzy match using similarity score
  const words = textLower.split(/\s+/);
  for (const word of words) {
    if (word.length >= 3) {
      const similarity = similarityScore(queryLower, word);
      if (similarity >= threshold) {
        return true;
      }
    }
  }

  // Check if all characters of query appear in order in text (subsequence match)
  let queryIndex = 0;
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      queryIndex++;
    }
  }
  if (queryIndex === queryLower.length) {
    return true;
  }

  // Normalize and check (remove spaces, hyphens, etc.)
  const normalizedQuery = queryLower.replace(/[-\s]/g, '');
  const normalizedText = textLower.replace(/[-\s]/g, '');
  if (normalizedText.includes(normalizedQuery)) {
    return true;
  }

  return false;
};

/**
 * Calculate relevance score for search results
 * Higher score = more relevant
 */
export const calculateRelevanceScore = (
  query: string,
  product: { name: string; description: string; category: string }
): number => {
  const queryLower = query.toLowerCase().trim();
  const nameLower = product.name.toLowerCase();
  const descLower = product.description.toLowerCase();
  const categoryLower = product.category.toLowerCase();

  let score = 0;

  // Exact name match gets highest score
  if (nameLower === queryLower) {
    score += 100;
  } else if (nameLower.startsWith(queryLower)) {
    score += 80;
  } else if (nameLower.includes(queryLower)) {
    score += 60;
  }

  // Category match
  if (categoryLower.includes(queryLower)) {
    score += 40;
  }

  // Description match
  if (descLower.includes(queryLower)) {
    score += 20;
  }

  // Fuzzy matching scores
  const nameSimilarity = similarityScore(queryLower, nameLower);
  if (nameSimilarity > 0.7) {
    score += nameSimilarity * 30;
  }

  const categorySimilarity = similarityScore(queryLower, categoryLower);
  if (categorySimilarity > 0.7) {
    score += categorySimilarity * 20;
  }

  // Word-by-word matching
  const queryWords = queryLower.split(/\s+/);
  const nameWords = nameLower.split(/\s+/);
  queryWords.forEach((qWord) => {
    nameWords.forEach((nWord) => {
      if (nWord.includes(qWord) || qWord.includes(nWord)) {
        score += 10;
      }
      const wordSimilarity = similarityScore(qWord, nWord);
      if (wordSimilarity > 0.8) {
        score += wordSimilarity * 15;
      }
    });
  });

  return score;
};

/**
 * Get search suggestions with fuzzy matching
 */
export const getSearchSuggestions = (
  query: string,
  products: Array<{ name: string; description: string; category: string; id: string }>,
  limit: number = 5
): Array<{ product: typeof products[0]; score: number }> => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const queryLower = query.toLowerCase().trim();

  // Calculate scores for all products
  const scored = products
    .map((product) => ({
      product,
      score: calculateRelevanceScore(queryLower, product),
    }))
    .filter((item) => item.score > 0) // Only include products with some relevance
    .sort((a, b) => b.score - a.score) // Sort by relevance
    .slice(0, limit); // Limit results

  return scored;
};

