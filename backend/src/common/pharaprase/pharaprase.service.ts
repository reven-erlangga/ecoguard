import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import nlp from 'compromise';

@Injectable()
export class PharapraseService {
  private slangMap: Record<string, string> = {};
  private exclamations: string[] = [];
  private englishColloquialisms: string[] = [];
  private protectedWords: Set<string> = new Set();

  constructor() {
    this.loadSlangDictionary();
    this.loadExclamations();
    this.loadEnglishColloquialisms();
    this.loadProtectedWords();
  }

  /**
   * Cleans informal Indonesian exclamations, interjections, and chat expressions
   * loaded dynamically from assets/indonesian_exclamations.txt.
   */
  cleanInterjections(text: string): string {
    let cleaned = text.toLowerCase();
    
    for (const exc of this.exclamations) {
      // Use boundary match to protect substrings in formal words (e.g. "lah" in "penjumlahan")
      const regex = new RegExp(`\\b${exc}\\b`, 'gi');
      cleaned = cleaned.replace(regex, '');
    }
    
    // Clean up double spaces and stray punctuations
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    return cleaned;
  }

  /**
   * Loads the exclamations dataset dynamically from assets/indonesian_exclamations.txt on startup.
   */
  private loadExclamations() {
    try {
      const filePath = path.resolve(process.cwd(), 'assets/indonesian_exclamations.txt');
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        this.exclamations = fileContent.split(/\r?\n/)
          .map(line => line.trim().toLowerCase())
          .filter(line => line.length > 0);
        console.log(`[PharapraseService] Successfully loaded ${this.exclamations.length} exclamations from assets/indonesian_exclamations.txt!`);
      } else {
        console.warn(`[PharapraseService] Exclamations dataset file not found at: ${filePath}`);
      }
    } catch (e) {
      console.error(`[PharapraseService] Failed to load exclamations dataset:`, e.message);
    }
  }

  /**
   * Loads the English colloquialisms dataset dynamically from assets/english_colloquialisms.txt on startup.
   */
  private loadEnglishColloquialisms() {
    try {
      const filePath = path.resolve(process.cwd(), 'assets/english_colloquialisms.txt');
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        this.englishColloquialisms = fileContent.split(/\r?\n/)
          .map(line => line.trim().toLowerCase())
          .filter(line => line.length > 0);
        console.log(`[PharapraseService] Successfully loaded ${this.englishColloquialisms.length} English colloquialisms from assets/english_colloquialisms.txt!`);
      } else {
        console.warn(`[PharapraseService] English colloquialisms dataset file not found at: ${filePath}`);
      }
    } catch (e) {
      console.error(`[PharapraseService] Failed to load English colloquialisms dataset:`, e.message);
    }
  }

  /**
   * Loads the English protected words dataset dynamically from assets/english_protected_words.txt on startup.
   */
  private loadProtectedWords() {
    try {
      const filePath = path.resolve(process.cwd(), 'assets/english_protected_words.txt');
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const words = fileContent.split(/\r?\n/)
          .map(line => line.trim().toLowerCase())
          .filter(line => line.length > 0);
        this.protectedWords = new Set(words);
        console.log(`[PharapraseService] Successfully loaded ${this.protectedWords.size} English protected words from assets/english_protected_words.txt!`);
      } else {
        console.warn(`[PharapraseService] English protected words dataset file not found at: ${filePath}`);
      }
    } catch (e) {
      console.error(`[PharapraseService] Failed to load English protected words dataset:`, e.message);
    }
  }

  /**
   * Loads the massive 15,168+ row Indonesian slang/typo CSV mapping dataset on startup.
   * Runs in less than 5ms with zero external dependencies!
   */
  private loadSlangDictionary() {
    try {
      const csvPath = path.resolve(process.cwd(), 'assets/nlp_kamus_dataset.csv');
      if (fs.existsSync(csvPath)) {
        const fileContent = fs.readFileSync(csvPath, 'utf8');
        const lines = fileContent.split(/\r?\n/);
        
        for (const line of lines) {
          if (!line.trim()) continue;
          
          // Split on the first comma to safely support any trailing commas in the replacement value
          const commaIndex = line.indexOf(',');
          if (commaIndex !== -1) {
            const slang = line.substring(0, commaIndex).trim().toLowerCase();
            const formal = line.substring(commaIndex + 1).trim();
            if (slang) {
              this.slangMap[slang] = formal;
            }
          }
        }
        console.log(`[PharapraseService] Successfully loaded ${Object.keys(this.slangMap).length} slang mappings from assets/nlp_kamus_dataset.csv!`);
      } else {
        console.warn(`[PharapraseService] Slang dictionary CSV not found at: ${csvPath}`);
      }
    } catch (e) {
      console.error(`[PharapraseService] Failed to load slang dictionary CSV:`, e.message);
    }
  }

  /**
   * Dynamically paraphrases English text by replacing words with their WordNet synonyms,
   * while filtering out colloquial/informal terms like "bro", "dude", "min", "admin", etc.
   */
  async dynamicParaphrase(text: string): Promise<string> {
    try {
      // 1. Expand contractions dynamically using compromise NLP!
      const doc = nlp(text);
      doc.contractions().expand();
      let sanitizedText = doc.text();

      // 2. Remove colloquial / informal slangs in English loaded dynamically from dataset
      for (const slang of this.englishColloquialisms) {
        // Match word, case-insensitively, optionally followed by a comma
        const regex = new RegExp(`\\b${slang}\\b,?\\s*`, 'gi');
        sanitizedText = sanitizedText.replace(regex, '');
      }

      // Clean up punctuation artifacts (like stray commas, double spaces)
      sanitizedText = sanitizedText.replace(/\s+/g, ' ').trim();

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const natural = require('natural');
      const tokenizer = new natural.WordTokenizer();
      const wordnet = new natural.WordNet();
      
      const words = tokenizer.tokenize(sanitizedText);
      if (!words || words.length === 0) return sanitizedText;
      
      const paraphrasedWords = [...words];

      // Paraphrase up to 4 words per sentence to keep response time fast
      const targetIndices = words
        .map((w, idx) => ({ word: w, idx }))
        .filter(item => {
          const lowerWord = item.word.toLowerCase();
          return item.word.length > 4 && !this.protectedWords.has(lowerWord);
        })
        .slice(0, 4);

      for (const item of targetIndices) {
        const word = item.word.toLowerCase();
        
        try {
          // Find synonyms via WordNet
          const synonyms = await new Promise<string[]>((resolve) => {
            // Set a timeout of 100ms for WordNet lookup to ensure it never hangs
            const timeout = setTimeout(() => resolve([]), 100);
            
            wordnet.lookup(word, (results) => {
              clearTimeout(timeout);
              if (!results || results.length === 0) {
                resolve([]);
                return;
              }
              
              // Protect nouns and domain terminology from being replaced
              const hasNounDefinition = results.some(res => res.pos === 'n');
              if (hasNounDefinition) {
                resolve([]);
                return;
              }
              
              const synList: string[] = [];
              results.forEach((res) => {
                if (res.synonyms) {
                  res.synonyms.forEach(syn => {
                    const cleanedSyn = syn.replace(/_/g, ' ');
                    if (cleanedSyn.toLowerCase() !== word && !synList.includes(cleanedSyn)) {
                      synList.push(cleanedSyn);
                    }
                  });
                }
              });
              resolve(synList);
            });
          });

          // If synonyms are found, pick a random one
          if (synonyms.length > 0) {
            const randomIndex = Math.floor(Math.random() * synonyms.length);
            paraphrasedWords[item.idx] = synonyms[randomIndex];
            console.log(`[PharapraseService NLP] Dynamic synonym replace: "${word}" -> "${synonyms[randomIndex]}"`);
          }
        } catch (wordNetError) {
          // Ignore individual word lookup failures and continue
        }
      }

      // Reconstruct sentence beautifully
      let result = paraphrasedWords.join(' ');
      
      // Clean up punctuation spacing
      result = result.replace(/\s+([.,!?;:])/g, '$1');
      if (result.length > 0) {
        result = result.charAt(0).toUpperCase() + result.slice(1);
      }
      
      // Final cosmetic polishing
      result = result.replace(/\s+/g, ' ').trim();
      return result;
    } catch (e) {
      console.warn('⚠️ Dynamic paraphrase via Natural/WordNet failed, returning original text.', e.message);
      return text;
    }
  }

  /**
   * Local rule-based paraphraser to translate informal Indonesian tweets into a formal report
   * when Gemini and free translation integrations are disabled or fail.
   * Performs high-speed O(1) hash map lookups per word across 15,168 slang definitions.
   */
  localParaphrase(text: string, location: string): string {
    const words = text.split(/\s+/);
    const mappedWords = words.map(word => {
      // Strip punctuation for matching, but preserve it for the output
      const cleanWord = word.toLowerCase().replace(/[.,!?;:()]/g, '');
      const formal = this.slangMap[cleanWord];
      if (formal) {
        const punctuation = word.slice(cleanWord.length);
        return formal + punctuation;
      }
      return word;
    });

    let formalText = mappedWords.join(' ');

    // Rapikan spasi ganda
    formalText = formalText.replace(/\s+/g, ' ').trim();
    if (formalText.length > 0) {
      formalText = formalText.charAt(0).toUpperCase() + formalText.slice(1);
    }

    // Tambahkan akhiran formal wilayah jika terdeteksi
    const locationSuffix = location ? ` di sekitar wilayah ${location}` : '';
    formalText = `${formalText}${locationSuffix}`;

    return formalText;
  }
}
