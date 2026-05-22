import { Injectable } from '@nestjs/common';
import nlp from 'compromise';

@Injectable()
export class CompromiseService {
  // Daftar kota populer sebagai fallback langsung
  private readonly fallbackCities = [
    'jakarta', 'bandung', 'surabaya', 'medan', 'bekasi', 
    'tangerang', 'depok', 'bogor', 'semarang', 'jogja', 'yogyakarta',
    'solo', 'malang', 'makassar', 'denpasar'
  ];

  extractLocations(text: string): string[] {
    const locations: string[] = [];

    // 1. Regex Jalan / Street names (highly specific and high priority!)
    // Captures: "jalan Menteng Raya", "jl. Menteng Raya", "jl Sudirman"
    const streetRegex = /(?:jalan|jl\.?)\s+([a-zA-Z0-9]+(?:\s+[a-zA-Z0-9]+){0,3})/gi;
    let match;
    while ((match = streetRegex.exec(text)) !== null) {
      locations.push(`jalan ${match[1].trim()}`);
    }

    // 2. Fallback preposisi lokasi
    // Mencari lokasi setelah preposisi "di", "ke", "deket", "sekitar", "daerah", "wilayah"
    // Batasi agar tidak menangkap kata depan itu sendiri (misal menghindari "sekitar jalan" jika ada "di sekitar jalan")
    const prepositionRegex = /(?:di|ke|deket|sekitar|daerah|wilayah)\s+(?!sekitar|deket|dekat|daerah|wilayah|jalan\b)([a-zA-Z0-9]+(?:\s+[a-zA-Z0-9]+){0,2})/gi;
    while ((match = prepositionRegex.exec(text)) !== null) {
      locations.push(match[1].trim());
    }

    // 3. Gunakan compromise (Default) untuk mendeteksi entitas Bahasa Inggris jika ada
    const doc = nlp(text);
    const compromiseResults = doc.places().out('array');
    locations.push(...compromiseResults);

    // 4. Fallback Pencocokan Kata Kota Langsung
    const lowerText = text.toLowerCase();
    for (const city of this.fallbackCities) {
      if (lowerText.includes(city)) {
        // Tambahkan jika belum ada dalam list
        const exists = locations.some(loc => loc.toLowerCase() === city);
        if (!exists) {
          locations.push(city);
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const rawStopwords = require('stopwords-id');

    // 5. Clean up, filter, and reject generic terms
    const stopwords = new Set([
      ...rawStopwords,
      'sekitar', 'deket', 'dekat', 'daerah', 'wilayah', 'jalan', 'jalanan', 'raya', 'di', 'jalan raya'
    ]);
    const uniqueLocations = [...new Set(locations)]
      .map(loc => loc.trim())
      .filter(loc => {
        // Abaikan jika terlalu pendek
        if (loc.length <= 3) return false;
        
        const lowerLoc = loc.toLowerCase();
        
        // Abaikan jika hanya berupa kata stopword tunggal
        if (stopwords.has(lowerLoc)) return false;
        
        // Jangan biarkan lokasi generic seperti "sekitar jalan" atau "di jalan" lolos
        if (lowerLoc === 'sekitar jalan' || lowerLoc === 'di jalan' || lowerLoc === 'dekat jalan' || lowerLoc === 'deket jalan') {
          return false;
        }
        
        return true;
      });

    return uniqueLocations;
  }
}
