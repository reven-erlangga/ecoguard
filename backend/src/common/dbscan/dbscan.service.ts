import { Injectable } from '@nestjs/common';

export interface LocationPoint {
  latitude: number;
  longitude: number;
  [key: string]: any;
}

@Injectable()
export class DbscanService {
  // Earth radius in kilometers
  private readonly EARTH_RADIUS = 6371;

  /**
   * Calculate distance between two points using Haversine formula
   */
  calculateDistance(p1: LocationPoint, p2: LocationPoint): number {
    const dLat = this.deg2rad(p2.latitude - p1.latitude);
    const dLon = this.deg2rad(p2.longitude - p1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(p1.latitude)) *
        Math.cos(this.deg2rad(p2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return this.EARTH_RADIUS * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * DBSCAN algorithm implementation for location clustering
   * @param points Array of points with latitude and longitude
   * @param epsilon Maximum distance between two points in kilometers
   * @param minPts Minimum number of points to form a dense region
   */
  dbscan<T extends LocationPoint>(points: T[], epsilon: number, minPts: number): T[][] {
    const clusters: T[][] = [];
    const visited = new Set<number>();
    const clustered = new Set<number>();

    const getNeighbors = (pointIdx: number): number[] => {
      const neighbors: number[] = [];
      for (let i = 0; i < points.length; i++) {
        if (i === pointIdx) continue;
        if (this.calculateDistance(points[pointIdx], points[i]) <= epsilon) {
          neighbors.push(i);
        }
      }
      return neighbors;
    };

    for (let i = 0; i < points.length; i++) {
      if (visited.has(i)) continue;

      visited.add(i);
      const neighbors = getNeighbors(i);

      if (neighbors.length >= minPts - 1) {
        const cluster: T[] = [points[i]];
        clustered.add(i);
        
        const seeds = [...neighbors];
        for (let j = 0; j < seeds.length; j++) {
          const currentPointIdx = seeds[j];

          if (!visited.has(currentPointIdx)) {
            visited.add(currentPointIdx);
            const currentNeighbors = getNeighbors(currentPointIdx);

            if (currentNeighbors.length >= minPts - 1) {
              for (const n of currentNeighbors) {
                if (!seeds.includes(n)) {
                  seeds.push(n);
                }
              }
            }
          }

          if (!clustered.has(currentPointIdx)) {
            cluster.push(points[currentPointIdx]);
            clustered.add(currentPointIdx);
          }
        }
        clusters.push(cluster);
      }
    }

    return clusters;
  }
}
