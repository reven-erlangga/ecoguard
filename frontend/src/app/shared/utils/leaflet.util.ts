let leafletPromise: Promise<typeof import('leaflet')> | null = null;

export function loadLeaflet(): Promise<typeof import('leaflet')> {
  if (leafletPromise) return leafletPromise;

  leafletPromise = new Promise(async (resolve, reject) => {
    try {
      const L = await import('leaflet');
      resolve(L);
    } catch (e) {
      reject(e);
    }
  });

  return leafletPromise;
}
