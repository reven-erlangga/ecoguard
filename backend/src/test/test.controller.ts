import { Controller, Post, Body } from '@nestjs/common';
import { AnalyzerService } from '../analyzer/analyzer.service';
import { FirebaseService } from '../firebase/firebase.service';

@Controller('test')
export class TestController {
  constructor(
    private readonly analyzerService: AnalyzerService,
    private readonly firebaseService: FirebaseService,
  ) {}

  @Post()
  async simulate(@Body('tweet') tweet: string) {
    if (!tweet) {
      return { success: false, message: 'Tweet payload is required' };
    }

    return this.analyzerService.evaluate(tweet);
  }

  @Post('cleanup')
  async cleanup() {
    try {
      const db = this.firebaseService.getFirestore();
      
      const snapshot = await db.collection('issue_categories').get();
      const deletePromises: Promise<any>[] = [];
      snapshot.forEach(doc => {
        deletePromises.push(doc.ref.delete());
      });
      await Promise.all(deletePromises);
      
      return { 
        success: true, 
        message: `Successfully wiped all ${snapshot.size} categories from issue_categories to start with a pristine clean slate!` 
      };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
}
