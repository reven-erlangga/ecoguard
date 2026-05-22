import { Injectable, Logger } from '@nestjs/common';
import { CompromiseService } from '../common/compromise/compromise.service';
import { DbscanService, LocationPoint } from '../common/dbscan/dbscan.service';
import { NormalizeService } from '../common/location-parser/normalize/normalize.service';
import { FuzzyMatchService } from '../common/location-parser/fuzzy-match/fuzzy-match.service';
import { OpenstreetmapService } from '../common/openstreetmap/openstreetmap.service';
import { GeminiService } from '../gemini/gemini.service';
import { FirebaseService } from '../firebase/firebase.service';
import { TranslateService } from '../common/translate/translate.service';
import { PharapraseService } from '../common/pharaprase/pharaprase.service';
import { ClusteringService } from '../common/clustering/clustering.service';
import { IssueService } from '../issue/issue.service';

@Injectable()
export class AnalyzerService {
  private readonly logger = new Logger(AnalyzerService.name);

  constructor(
    private readonly compromiseService: CompromiseService,
    private readonly dbscanService: DbscanService,
    private readonly normalizeService: NormalizeService,
    private readonly fuzzyMatchService: FuzzyMatchService,
    private readonly openstreetmapService: OpenstreetmapService,
    private readonly geminiService: GeminiService,
    private readonly firebaseService: FirebaseService,
    private readonly translateService: TranslateService,
    private readonly pharapraseService: PharapraseService,
    private readonly clusteringService: ClusteringService,
    private readonly issueService: IssueService,
  ) { }

  /**
   * Evaluate a single tweet flow
   * @param tweet The raw tweet text
   * @param sourceTweetId Optional external ID (e.g. from X Stream)
   */
  async evaluate(tweet: string, sourceTweetId?: string) {
    // 1. Text extraction using Compromise
    const extractedLocations = this.compromiseService.extractLocations(tweet);

    // 2. Process and geocode locations
    const points = await this.geocodeLocations(extractedLocations);

    // 3. Check Gemini configuration status
    const isGeminiEnabled = await this.checkGeminiEnabled();

    // Preprocess raw tweet to highly formal Indonesian using cleanInterjections and localParaphrase
    const cleanedTweet = this.pharapraseService.cleanInterjections(tweet);
    const formalIndoTweet = this.pharapraseService.localParaphrase(cleanedTweet, '');

    // 4. Translate, verify, and paraphrase using the preprocessed formal Indo tweet
    const extractedLocs = extractedLocations || [];
    const { translatedTitle, translatedDescription } = await this.translateAndParaphrase(
      formalIndoTweet,
      extractedLocs,
      points,
      isGeminiEnabled
    );

    // 5. Dynamic Semantic Category Determination & Auto-Registration (Local AI Unsupervised Online Learning!)
    const bestCategory = await this.determineCategoryLocally(translatedDescription, formalIndoTweet);

    // Finalize offline title if needed
    let finalTitle = translatedTitle;
    if (translatedTitle === 'Official Report') {
      const locName = extractedLocs.length > 0 ? extractedLocs[0] : '';
      const locationSuffix = locName ? ` in ${locName}` : '';
      finalTitle = `Official Report on ${bestCategory.name}${locationSuffix}`;
    }

    // 6. Spatial Clustering (Location) using DBSCAN
    const clusters = this.performSpatialClustering(points);

    // 7. Auto-save to Firebase Issue
    const tweetId = sourceTweetId || 'test-tweet-' + Math.random().toString(36).substring(2, 9);
    const geocodedPoints = points.map(p => ({ name: p.name, lat: p.latitude, lon: p.longitude }));
    const extLocs = extractedLocations || [];

    const hasLocation = geocodedPoints.length > 0;
    const finalStatus = hasLocation ? 'PENDING' : 'NEED_INFO';

    if (!hasLocation) {
      console.log(`\n[AnalyzerService] [TWEET REPLY TRIGGER] No valid locations or geocoded coordinates found for tweet: "${tweet}".`);
      console.log(`[AnalyzerService] [TWEET REPLY TRIGGER] Sistem akan memicu reply ke tweet ID "${tweetId}" untuk meminta alamat lengkap, status laporan diatur ke "${finalStatus}"!\n`);
    }

    const savedIssue = await this.issueService.create({
      source_tweet_id: tweetId,
      title: finalTitle,
      content: translatedDescription,
      location: geocodedPoints.length > 0 
        ? geocodedPoints 
        : null,
      issue_category_id: bestCategory.id || 'ENVIRONMENT_AND_SANITATION',
      status: finalStatus,
      metadata: {
        clusters: clusters.map((cluster, idx) => ({
          cluster_index: idx,
          locations: cluster.map(p => p.name)
        })),
      }
    });

    // 8. Format response
    return {
      success: true,
      message: 'Evaluation and Firebase persistence completed successfully',
      data: {
        originalTweet: tweet,
        translatedTitle: finalTitle,
        content: translatedDescription,
        extractedLocations,
        geocodedPoints,
        spatialClusters: clusters.map((cluster, idx) => ({
          cluster_index: idx,
          locations: cluster.map(p => p.name)
        })),
        issue_category_id: bestCategory.id,
      },
      savedIssue,
    };
  }

  /**
   * Geocodes each extracted location using fuzzy matching and OpenStreetMap
   */
  private async geocodeLocations(extractedLocations: string[]): Promise<LocationPoint[]> {
    const points: LocationPoint[] = [];
    for (const loc of extractedLocations) {
      const normalized = this.normalizeService.normalizeText(loc);
      const matchedCity = this.fuzzyMatchService.fuzzyMatch(normalized);
      const query = matchedCity || normalized;

      try {
        const coords = await this.openstreetmapService.getCoordinates(query);
        if (coords) {
          points.push({
            latitude: coords.latitude,
            longitude: coords.longitude,
            name: query,
          });
        }
      } catch (error) {
        this.logger.error(`Error geocoding "${query}": ${error.message}`);
      }
    }
    return points;
  }

  /**
   * Checks if Gemini integration is enabled in configurations
   */
  private async checkGeminiEnabled(): Promise<boolean> {
    try {
      const db = this.firebaseService.getFirestore();
      const geminiConfigDoc = await db.collection('configurations').doc('gemini').get();
      if (geminiConfigDoc.exists) {
        const data = geminiConfigDoc.data();
        const enabled = !!(data && data.enabled === true);
        this.logger.log(`Gemini Config in Firebase: ${enabled ? 'Enabled' : 'Disabled'}`);
        return enabled;
      } else {
        await db.collection('configurations').doc('gemini').set({ enabled: false });
        this.logger.log('Gemini Config document not found. Created defaults with enabled=false.');
        return false;
      }
    } catch (configError) {
      this.logger.warn(`Failed to check Gemini Firestore configuration. Defaulting to false. ${configError.message}`);
      return false;
    }
  }

  /**
   * Performs translation, OSM verification, and paraphrasing using either Gemini or a fallback translator
   */
  private async translateAndParaphrase(
    tweet: string,
    extractedLocs: string[],
    points: LocationPoint[],
    isGeminiEnabled: boolean
  ): Promise<{ translatedTitle: string; translatedDescription: string; geminiVerified: boolean }> {
    // Isolate dynamic title template literal logic to prevent redundant repeats
    const rawTitle = `Report: ${extractedLocs.length > 0 ? extractedLocs[0] : 'General Issue'}`;
    let translatedTitle = rawTitle;
    let translatedDescription = tweet;
    let geminiVerified = true;

    if (isGeminiEnabled) {
      try {
        const result = await this.translateWithGemini(tweet, rawTitle, extractedLocs, points);
        translatedTitle = result.title;
        translatedDescription = result.description;
        geminiVerified = result.verified;
      } catch (geminiError) {
        this.logger.warn(
          `[Graceful Degradation] Gemini API failed, falling back to Free Google Translate. Error: ${geminiError.message}`
        );
        isGeminiEnabled = false;
      }
    }

    if (!isGeminiEnabled) {
      const result = await this.translateWithFreeGoogle(tweet, rawTitle, extractedLocs);
      translatedTitle = result.title;
      translatedDescription = result.description;
    }

    return { translatedTitle, translatedDescription, geminiVerified };
  }

  /**
   * Translates and paraphrases content using NestJS Gemini Service
   */
  private async translateWithGemini(
    tweet: string,
    rawTitle: string,
    extractedLocs: string[],
    points: LocationPoint[]
  ): Promise<{ title: string; description: string; verified: boolean }> {
    let geminiVerified = true;
    if (extractedLocs.length > 0) {
      geminiVerified = await this.geminiService.verifyAddressWithOSM(
        extractedLocs[0],
        points.map(p => ({ name: p.name, lat: p.latitude, lon: p.longitude }))
      );
    }

    const translatedTitleRaw = await this.geminiService.translateToEnglish(rawTitle);
    const translatedDescriptionRaw = await this.geminiService.translateToEnglish(tweet);

    const title = await this.pharapraseService.dynamicParaphrase(translatedTitleRaw);
    const description = await this.pharapraseService.dynamicParaphrase(translatedDescriptionRaw);

    return { title, description, verified: geminiVerified };
  }

  /**
   * Translates and paraphrases content using Free Google Translate
   */
  private async translateWithFreeGoogle(
    tweet: string,
    rawTitle: string,
    extractedLocs: string[]
  ): Promise<{ title: string; description: string }> {
    try {
      this.logger.log(`Free Google Translate translating to English...`);
      const translatedTitleRaw = await this.translateService.translateToEnglishFree(rawTitle);
      const translatedDescriptionRaw = await this.translateService.translateToEnglishFree(tweet);

      const title = await this.pharapraseService.dynamicParaphrase(translatedTitleRaw);
      const description = await this.pharapraseService.dynamicParaphrase(translatedDescriptionRaw);
      this.logger.log(`Free Translation & Dynamic Paraphrase success.`);

      return { title, description };
    } catch (transError) {
      this.logger.warn(`Free Google Translate fallback failed. Using local rule-based paraphraser instead. Error: ${transError.message}`);

      const locName = extractedLocs.length > 0 ? extractedLocs[0] : '';
      const title = `Official Report`;
      const description = this.pharapraseService.localParaphrase(tweet, locName);

      return { title, description };
    }
  }

  /**
   * Automatically maps issue text to a category using sparse Cosine Similarity
   * against dynamically updated centroids in Firestore, or spawns a new category
   * if no close match is found (100% offline-friendly, dynamic online learning!).
   */
  private async determineCategoryLocally(translatedDescription: string, originalTweet: string): Promise<{ id: string; name: string }> {
    const tweetWordMap = this.clusteringService.getWordFrequencyMap(translatedDescription);
    const db = this.firebaseService.getFirestore();
    const categoriesCol = db.collection('issue_categories');
    
    let bestCategory: any = null;
    
    try {
      const catSnapshot = await categoriesCol.get();
      catSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data) {
          // Initialize centroid if not present
          let centroid = data.centroid;
          if (!centroid) {
            // Seed centroid using words in the category name as a starter distribution
            centroid = this.clusteringService.getWordFrequencyMap(data.name || doc.id);
          }
          
          const similarity = this.clusteringService.calculateSparseCosineSimilarity(tweetWordMap, centroid);
          
          if (!bestCategory || similarity > bestCategory.similarity) {
            bestCategory = {
              id: doc.id,
              name: data.name || doc.id,
              similarity,
              centroid
            };
          }
        }
      });
    } catch (dbError) {
      this.logger.warn(`Failed to fetch dynamic categories from Firestore: ${dbError.message}`);
    }
    
    const similarityThreshold = 0.20; // 20% word context similarity threshold
    
    if (bestCategory && bestCategory.similarity >= similarityThreshold) {
      this.logger.log(`[Local AI] Assigned to existing category: "${bestCategory.name}" (Similarity: ${(bestCategory.similarity * 100).toFixed(1)}%)`);
      
      // Dynamic online learning update step!
      const updatedCentroid = this.clusteringService.updateCentroid(bestCategory.centroid || {}, tweetWordMap);
      try {
        await categoriesCol.doc(bestCategory.id).update({
          centroid: updatedCentroid
        });
        this.logger.log(`[Local AI Centroid Update] Updated cluster centroid for "${bestCategory.name}"`);
      } catch (updateError) {
        this.logger.warn(`Failed to update category centroid: ${updateError.message}`);
      }
      
      return { id: bestCategory.id, name: bestCategory.name };
    }
    
    // Spawning a brand-new dynamic category!
    this.logger.log(`[Local AI] No close category matched (Highest similarity: ${bestCategory ? (bestCategory.similarity * 100).toFixed(1) : 0}%). Spawning new category...`);
    
    // Generate new category name dynamically based on dominant tweet nouns/keywords
    const rawNewName = this.generateCategoryName(originalTweet);
    let englishNewName = rawNewName;
    
    try {
      // Translate the dynamically generated name to English
      englishNewName = await this.translateService.translateToEnglishFree(rawNewName);
      // Capitalize each word beautifully
      englishNewName = englishNewName.split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    } catch (transError) {
      this.logger.warn(`Failed to translate new category name. Using raw: "${rawNewName}"`);
    }
    
    const newId = englishNewName.toUpperCase()
      .replace(/[^A-Z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
      
    const finalId = newId || 'GENERAL_ISSUE';
    const finalName = englishNewName || 'General Issue';
    
    try {
      await categoriesCol.doc(finalId).set({
        name: finalName,
        centroid: tweetWordMap // Initialize centroid with current tweet's word map
      });
      this.logger.log(`[Database Expansion] Dynamically auto-registered new category: "${finalName}" (${finalId})`);
    } catch (createError) {
      this.logger.warn(`Failed to register new category: ${createError.message}`);
    }
    
    return { id: finalId, name: finalName };
  }

  /**
   * Generates a simple Indonesian keyword-based dynamic category label
   */
  private generateCategoryName(tweetText: string): string {
    const stopWords = new Set([
      'ada', 'dan', 'di', 'dari', 'ke', 'untuk', 'dengan', 'saya', 'kami', 'ini', 'itu', 'adalah',
      'yang', 'bisa', 'akan', 'tolong', 'min', 'banyak', 'sangat', 'parah', 'sudah', 'oleh', 'karena',
      'jalan', 'jalanan', 'lokasi', 'tempat', 'daerah', 'wilayah'
    ]);
    
    const words = tweetText.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.has(w));
      
    if (words.length === 0) return 'Laporan Umum';
    
    // Pick the top 2 unique keywords
    const unique = Array.from(new Set(words)).slice(0, 2);
    return unique.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' & ');
  }

  /**
   * Performs spatial clustering on geocoded points using DBSCAN
   */
  private performSpatialClustering(points: LocationPoint[]): LocationPoint[][] {
    let clusters: LocationPoint[][] = [];
    if (points.length > 0) {
      const pointsToCluster = [...points];
      if (pointsToCluster.length === 1) {
        pointsToCluster.push({
          latitude: pointsToCluster[0].latitude + 0.01,
          longitude: pointsToCluster[0].longitude + 0.01,
          name: `${pointsToCluster[0].name} (Simulated Near)`,
        });
      }

      const epsilon = process.env.DBSCAN_EPSILON ? parseFloat(process.env.DBSCAN_EPSILON) : 3.0;
      const minPts = process.env.DBSCAN_MIN_PTS ? parseInt(process.env.DBSCAN_MIN_PTS, 10) : 2;

      this.logger.log(`Running DBSCAN with Epsilon=${epsilon}km, MinPts=${minPts} on ${pointsToCluster.length} points...`);
      clusters = this.dbscanService.dbscan(pointsToCluster, epsilon, minPts);
    }
    return clusters;
  }
}
