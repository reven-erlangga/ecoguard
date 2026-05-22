import type * as Leaflet from 'leaflet';

let leafletPromise: Promise<typeof Leaflet> | null = null;

export function loadLeaflet(): Promise<typeof Leaflet> {
  if (leafletPromise) return leafletPromise;

  leafletPromise = import('leaflet').then((module) => {
    const mod = module as unknown as (typeof Leaflet & { default?: typeof Leaflet });
    return (mod.default ?? mod) as typeof Leaflet;
  });

  return leafletPromise;
}
