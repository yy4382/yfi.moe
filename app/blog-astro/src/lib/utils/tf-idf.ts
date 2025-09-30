import nodejieba from "nodejieba";

export interface Document {
  id: string;
  text: string;
}

export interface SimilarDocument {
  id: string;
  score: number;
}

/**
 * Tokenizes text into words using nodejieba for Chinese text segmentation
 */
function tokenize(text: string): string[] {
  // Use nodejieba to segment Chinese text properly
  const tokens = nodejieba.cut(text);

  // Filter out very short tokens and normalize
  return tokens
    .map((token) => token.toLowerCase().trim())
    .filter((word) => word.length > 1); // Filter out single characters and empty strings
}

/**
 * Calculates term frequency for a document
 */
function calculateTF(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  const totalTokens = tokens.length;

  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }

  // Normalize by total tokens
  for (const [term, count] of tf.entries()) {
    tf.set(term, count / totalTokens);
  }

  return tf;
}

/**
 * Calculates inverse document frequency across all documents
 */
function calculateIDF(documents: string[][]): Map<string, number> {
  const idf = new Map<string, number>();
  const totalDocs = documents.length;

  // Count documents containing each term
  const docFrequency = new Map<string, number>();
  for (const tokens of documents) {
    const uniqueTokens = new Set(tokens);
    for (const token of uniqueTokens) {
      docFrequency.set(token, (docFrequency.get(token) || 0) + 1);
    }
  }

  // Calculate IDF
  for (const [term, docCount] of docFrequency.entries()) {
    idf.set(term, Math.log(totalDocs / docCount));
  }

  return idf;
}

/**
 * Calculates TF-IDF vector for a document
 */
function calculateTFIDF(
  tf: Map<string, number>,
  idf: Map<string, number>,
): Map<string, number> {
  const tfidf = new Map<string, number>();

  for (const [term, tfValue] of tf.entries()) {
    const idfValue = idf.get(term) || 0;
    tfidf.set(term, tfValue * idfValue);
  }

  return tfidf;
}

/**
 * Calculates cosine similarity between two TF-IDF vectors
 */
function cosineSimilarity(
  vec1: Map<string, number>,
  vec2: Map<string, number>,
): number {
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  // Calculate dot product and norms
  const allTerms = new Set([...vec1.keys(), ...vec2.keys()]);

  for (const term of allTerms) {
    const val1 = vec1.get(term) || 0;
    const val2 = vec2.get(term) || 0;

    dotProduct += val1 * val2;
    norm1 += val1 * val1;
    norm2 += val2 * val2;
  }

  if (norm1 === 0 || norm2 === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

/**
 * Finds similar documents to a target document using TF-IDF and cosine similarity
 *
 * @param targetId - ID of the document to find similar documents for
 * @param documents - Array of all documents to compare against
 * @param limit - Maximum number of similar documents to return (default: 3)
 * @returns Array of similar documents sorted by similarity score (highest first)
 */
export function findSimilarDocuments(
  targetId: string,
  documents: Document[],
  limit = 3,
): SimilarDocument[] {
  // Find the target document
  const targetDoc = documents.find((doc) => doc.id === targetId);
  if (!targetDoc) {
    return [];
  }

  // Tokenize all documents
  const allTokens = documents.map((doc) => tokenize(doc.text));
  const targetTokens = tokenize(targetDoc.text);

  // Calculate IDF across all documents
  const idf = calculateIDF(allTokens);

  // Calculate TF-IDF for target document
  const targetTF = calculateTF(targetTokens);
  const targetTFIDF = calculateTFIDF(targetTF, idf);

  // Calculate similarity scores for all other documents
  const similarities: SimilarDocument[] = [];

  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];

    // Skip the target document itself
    if (doc.id === targetId) {
      continue;
    }

    const docTF = calculateTF(allTokens[i]);
    const docTFIDF = calculateTFIDF(docTF, idf);

    const similarity = cosineSimilarity(targetTFIDF, docTFIDF);

    similarities.push({
      id: doc.id,
      score: similarity,
    });
  }

  // Sort by similarity score (descending) and return top N
  return similarities.sort((a, b) => b.score - a.score).slice(0, limit);
}
