import { Injectable } from '@nestjs/common';
import * as natural from 'natural';

@Injectable()
export class SemanticClassifierService {
  /**
   * Dynamically classifies English text into a set of categories using WordNet semantic similarity.
   * Completely unsupervised, zero-shot, dataset-free, and deep learning-free!
   */
  async classifyWithWordNet(
    text: string, 
    categories: { id: string; name: string }[]
  ): Promise<{ id: string; name: string }> {
    try {
      const tokenizer = new natural.WordTokenizer();
      const wordnet = new natural.WordNet();
      
      const tokens = tokenizer.tokenize(text.toLowerCase());
      if (!tokens || tokens.length === 0) {
        return categories[0];
      }

      // We will calculate a semantic score for each category
      const scores: Record<string, number> = {};

      // Initialize scores
      categories.forEach(cat => {
        scores[cat.name] = 0;
      });

      // Prepare target English keywords for each category dynamically!
      const categoriesWithTokens: { id: string; name: string; targetTokens: string[] }[] = [];

      for (const category of categories) {
        // Tokenize the English name and keep only content words
        const targetTokens = tokenizer.tokenize(category.name.toLowerCase())
          .filter(t => t.length > 2 && t !== 'and' && t !== 'the' && t !== 'for');

        console.log(`[WordNet Classifier] Dynamically mapped category "${category.name}" to English tokens: ${JSON.stringify(targetTokens)}`);
        categoriesWithTokens.push({ id: category.id, name: category.name, targetTokens });
      }

      // Calculate semantic similarity scores purely automatically using WordNet!
      for (const category of categoriesWithTokens) {
        for (const token of tokens) {
          if (token.length <= 3) continue; // skip short stop words

          // Direct match boosts score
          if (category.targetTokens.includes(token)) {
            scores[category.name] += 10;
            continue;
          }

          // Dynamic WordNet lookup to calculate graph similarity with target tokens
          try {
            const similarity = await new Promise<number>((resolve) => {
              const timeout = setTimeout(() => resolve(0), 50);

              wordnet.lookup(token, (results) => {
                clearTimeout(timeout);
                if (!results || results.length === 0) {
                  resolve(0);
                  return;
                }

                let maxScore = 0;
                results.forEach((res) => {
                  // 1. Synonym check
                  if (res.synonyms) {
                    res.synonyms.forEach(syn => {
                      const cleanSyn = syn.toLowerCase().replace(/_/g, ' ');
                      category.targetTokens.forEach(target => {
                        if (cleanSyn.includes(target) || target.includes(cleanSyn)) {
                          maxScore = Math.max(maxScore, 5); // Match synonym
                        }
                      });
                    });
                  }

                  // 2. Gloss / definition overlap (Highly semantic graph similarity check!)
                  if (res.gloss) {
                    const glossTokens = tokenizer.tokenize(res.gloss.toLowerCase());
                    category.targetTokens.forEach(target => {
                      if (glossTokens.includes(target)) {
                        maxScore = Math.max(maxScore, 3); // Overlap in definition
                      }
                    });
                  }
                });
                resolve(maxScore);
              });
            });

            scores[category.name] += similarity;
          } catch (err) {
            // Ignore individual lookup errors
          }
        }
      }

      // Find the category with the highest score
      let bestCategory = categories[0];
      let highestScore = -1;

      for (const [catName, score] of Object.entries(scores)) {
        console.log(`[WordNet Classifier] Category "${catName}" scored: ${score}`);
        if (score > highestScore) {
          highestScore = score;
          const found = categories.find(c => c.name === catName);
          if (found) {
            bestCategory = found;
          }
        }
      }

      return bestCategory;
    } catch (e) {
      console.warn('WordNet classification failed, returning default category.', e.message);
      return categories[0];
    }
  }
}
