import { Injectable } from '@nestjs/common';

@Injectable()
export class ClusteringService {
  /**
   * Calculates Sparse Cosine Similarity between two term frequency maps
   */
  calculateSparseCosineSimilarity(mapA: Record<string, number>, mapB: Record<string, number>): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (const val of Object.values(mapA)) {
      normA += val * val;
    }
    for (const val of Object.values(mapB)) {
      normB += val * val;
    }

    if (normA === 0 || normB === 0) return 0;

    for (const [word, valA] of Object.entries(mapA)) {
      if (mapB[word]) {
        dotProduct += valA * mapB[word];
      }
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Generates a sparse term frequency map from text
   */
  getWordFrequencyMap(text: string): Record<string, number> {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2);
    
    const map: Record<string, number> = {};
    for (const w of words) {
      map[w] = (map[w] || 0) + 1;
    }
    return map;
  }

  /**
   * Updates an existing centroid with online learning weight adjustment
   */
  updateCentroid(centroid: Record<string, number>, newMap: Record<string, number>, learningRate = 0.2): Record<string, number> {
    const updated: Record<string, number> = { ...centroid };
    
    for (const [word, freq] of Object.entries(newMap)) {
      updated[word] = (updated[word] || 0) * (1 - learningRate) + freq * learningRate;
    }
    
    // Prune very low weight keys to keep Firestore documents light
    for (const [word, weight] of Object.entries(updated)) {
      if (weight < 0.05) {
        delete updated[word];
      }
    }
    
    return updated;
  }
}
