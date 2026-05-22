import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { keysToCamelCase } from '../utils/case-transform.util';

@Injectable()
export class CamelCasePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // Transform incoming body and query parameters to camelCase
    if (metadata.type === 'body' || metadata.type === 'query') {
      return keysToCamelCase(value);
    }
    return value;
  }
}
