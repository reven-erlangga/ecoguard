import { Injectable } from '@nestjs/common';
import * as natural from 'natural';

@Injectable()
export class NormalizeService {
  private readonly tokenizer: natural.WordTokenizer;

  constructor() {
    // Inisialisasi tokenizer dari library natural
    this.tokenizer = new natural.WordTokenizer();
  }

  // Daftar singkatan umum untuk dinormalisasi
  private readonly abbreviationMap: { [key: string]: string } = {
    'jkt': 'jakarta',
    'jabar': 'jawa barat',
    'jateng': 'jawa tengah',
    'jatim': 'jawa timur',
    'sulsel': 'sulawesi selatan',
    'sultra': 'sulawesi tenggara',
    'sumbar': 'sumatera barat',
    'sumut': 'sumatera utara',
    'dki': 'dki jakarta',
    'yogya': 'yogyakarta',
    'jogja': 'yogyakarta',
    'bdg': 'bandung',
    'smg': 'semarang',
    'sby': 'surabaya',
  };

  /**
   * Normalisasi teks menggunakan Natural library
   */
  normalizeText(text: string): string {
    const lowercased = text.toLowerCase().trim();
    
    // 1. Gunakan tokenizer dari library natural
    // Ini otomatis memisahkan kata dan menghapus karakter spesial/tanda baca
    const words = this.tokenizer.tokenize(lowercased);
    
    if (!words || words.length === 0) {
      return '';
    }
    
    // 2. Ganti singkatan berdasarkan map kita
    const replacedWords = words.map(word => this.abbreviationMap[word] || word);
    
    return replacedWords.join(' ');
  }
}
