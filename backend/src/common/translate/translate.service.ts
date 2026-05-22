import { Injectable } from '@nestjs/common';

@Injectable()
export class TranslateService {
  async translateText(text: string, toLanguage = 'en', fromLanguage?: string): Promise<string> {
    try {
      const googleTranslate = require('@iamtraction/google-translate');

      const options: any = { to: toLanguage };
      if (fromLanguage) {
        options.from = fromLanguage;
      }

      console.log(`[TranslateService] Free Google Translate: "${text}" from: ${fromLanguage || 'auto'} -> to: ${toLanguage}`);
      const res = await googleTranslate(text, options);
      return res.text || text;
    } catch (error) {
      console.warn(`⚠️ Free translation failed from: ${fromLanguage || 'auto'} -> to: ${toLanguage}:`, error.message);
      return text;
    }
  }

  async translateToEnglishFree(text: string): Promise<string> {
    return this.translateText(text, 'en');
  }
}
