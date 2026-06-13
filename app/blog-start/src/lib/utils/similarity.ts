export interface Document {
  id: string;
  text: string;
}

export interface SimilarDocument {
  id: string;
  score: number;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);
}

function calculateTF(tokens: string[]) {
  const tf = new Map<string, number>();
  const totalTokens = Math.max(tokens.length, 1);
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }
  for (const [term, count] of tf.entries()) {
    tf.set(term, count / totalTokens);
  }
  return tf;
}

function calculateIDF(documents: string[][]) {
  const idf = new Map<string, number>();
  const docFrequency = new Map<string, number>();
  for (const tokens of documents) {
    for (const token of new Set(tokens)) {
      docFrequency.set(token, (docFrequency.get(token) || 0) + 1);
    }
  }
  for (const [term, count] of docFrequency.entries()) {
    idf.set(term, Math.log(documents.length / count));
  }
  return idf;
}

function calculateTFIDF(tf: Map<string, number>, idf: Map<string, number>) {
  const tfidf = new Map<string, number>();
  for (const [term, tfValue] of tf.entries()) {
    tfidf.set(term, tfValue * (idf.get(term) || 0));
  }
  return tfidf;
}

function cosineSimilarity(
  vec1: Map<string, number>,
  vec2: Map<string, number>,
) {
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  const terms = new Set([...vec1.keys(), ...vec2.keys()]);
  for (const term of terms) {
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

export function findSimilarDocuments(
  targetId: string,
  documents: Document[],
  limit = 3,
): SimilarDocument[] {
  const targetDoc = documents.find((doc) => doc.id === targetId);
  if (!targetDoc) {
    return [];
  }
  const allTokens = documents.map((doc) => tokenize(doc.text));
  const idf = calculateIDF(allTokens);
  const targetTFIDF = calculateTFIDF(
    calculateTF(tokenize(targetDoc.text)),
    idf,
  );

  return documents
    .map((doc, index) => {
      if (doc.id === targetId) {
        return null;
      }
      return {
        id: doc.id,
        score: cosineSimilarity(
          targetTFIDF,
          calculateTFIDF(calculateTF(allTokens[index] ?? []), idf),
        ),
      };
    })
    .filter((item) => item !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
