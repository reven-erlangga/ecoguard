import { Injectable } from '@nestjs/common';
import { CompromiseService } from '../common/compromise/compromise.service';
import { DbscanService, LocationPoint } from '../common/dbscan/dbscan.service';
import { NormalizeService } from '../common/location-parser/normalize/normalize.service';
import { FuzzyMatchService } from '../common/location-parser/fuzzy-match/fuzzy-match.service';
import { OpenstreetmapService } from '../common/openstreetmap/openstreetmap.service';

@Injectable()
export class TestService {
  constructor(
    private readonly compromiseService: CompromiseService,
    private readonly dbscanService: DbscanService,
    private readonly normalizeService: NormalizeService,
    private readonly fuzzyMatchService: FuzzyMatchService,
    private readonly openstreetmapService: OpenstreetmapService,
  ) {}

  async simulate(tweet: string) {
    console.log(`[Test] Received tweet: "${tweet}"`);

    // 1. Ekstraksi teks menggunakan compromise
    const extractedLocations = this.compromiseService.extractLocations(tweet);
    console.log(`[Test] Extracted locations:`, extractedLocations);

    const points: LocationPoint[] = [];

    // 2. Proses setiap lokasi yang ditemukan
    for (const loc of extractedLocations) {
      // a. Normalisasi teks (misal: "jkt" -> "jakarta")
      const normalized = this.normalizeService.normalizeText(loc);
      
      // b. Fuzzy matching dengan daftar kota besar
      const matchedCity = this.fuzzyMatchService.fuzzyMatch(normalized);
      
      // Gunakan hasil fuzzy match jika ada, jika tidak gunakan teks yang sudah dinormalisasi
      const query = matchedCity || normalized;
      console.log(`[Test] Processing "${loc}" -> Normalized: "${normalized}" -> Query: "${query}"`);

      // c. Ambil koordinat asli dari OpenStreetMap (Geocoding)
      try {
        const coords = await this.openstreetmapService.getCoordinates(query);
        if (coords) {
          console.log(`[Test] Found coordinates for "${query}":`, coords);
          points.push({
            latitude: coords.latitude,
            longitude: coords.longitude,
            name: query,
          });
        } else {
          console.log(`[Test] Coordinates not found for "${query}"`);
        }
      } catch (error) {
        console.error(`[Test] Error geocoding "${query}":`, error.message);
      }
    }

    // 3. Simulasi DBSCAN clustering
    let clusters: LocationPoint[][] = [];
    
    if (points.length > 0) {
      // HACK UNTUK SIMULASI: DBSCAN butuh minimal points (minPts) untuk membentuk cluster.
      // Jika hasil geocoding hanya menghasilkan 1 titik, DBSCAN tidak akan membentuk cluster.
      // Jadi, jika hanya ada 1 titik, kita duplikasi titik tersebut dengan sedikit pergeseran
      // agar algoritma DBSCAN bisa berjalan dan menghasilkan cluster untuk dilihat hasilnya.
      if (points.length === 1) {
        console.log(`[Test] Only 1 point found. Adding a simulated nearby point for DBSCAN.`);
        points.push({
          latitude: points[0].latitude + 0.01,
          longitude: points[0].longitude + 0.01,
          name: `${points[0].name} (Simulated Near)`,
        });
      }

      // Get DBSCAN config from environment variables with optimized defaults (Epsilon: 3.0km, MinPts: 2)
      const epsilon = process.env.DBSCAN_EPSILON ? parseFloat(process.env.DBSCAN_EPSILON) : 3.0;
      const minPts = process.env.DBSCAN_MIN_PTS ? parseInt(process.env.DBSCAN_MIN_PTS, 10) : 2;

      console.log(`[Test] Running DBSCAN with Epsilon=${epsilon}km, MinPts=${minPts}...`);
      clusters = this.dbscanService.dbscan(points, epsilon, minPts);
      console.log(`[Test] DBSCAN found ${clusters.length} clusters`);
    }


    return {
      success: true,
      message: 'Simulation completed with real geocoding',
      data: {
        originalTweet: tweet,
        extractedLocations,
        geocodedPoints: points.map(p => ({ name: p.name, lat: p.latitude, lon: p.longitude })),
        clusters: clusters.map(cluster => cluster.map(p => p.name)),
      },
    };
  }
}
