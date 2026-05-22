import { Module } from '@nestjs/common';
import { ClusteringService } from './clustering.service';
import { SemanticClassifierService } from './semantic-classifier.service';

@Module({
  providers: [ClusteringService, SemanticClassifierService],
  exports: [ClusteringService, SemanticClassifierService],
})
export class ClusteringModule {}
