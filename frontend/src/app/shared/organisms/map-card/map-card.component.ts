import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, PLATFORM_ID, ViewChild, effect, inject, input, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CardComponent } from '../../molecules/card/card.component';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { loadLeaflet } from '../../utils/leaflet.util';

@Component({
  selector: 'app-map-card',
  imports: [CardComponent],
  templateUrl: './map-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host ::ng-deep .leaflet-container {
      background: #0f172a !important;
    }
    :host ::ng-deep .leaflet-tile-pane {
      opacity: 0.9;
    }
  `],
})
export class MapCardComponent {
  readonly latitude = input<number | null>(null);
  readonly longitude = input<number | null>(null);

  protected readonly faLocationDot = faLocationDot;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  @ViewChild('mapContainer', { read: ElementRef }) private mapContainer?: ElementRef<HTMLDivElement>;
  private readonly viewReady = signal(false);

  private map: any | null = null;
  private marker: any | null = null;
  private glowOuter: any | null = null;
  private glowInner: any | null = null;

  constructor() {
    effect(() => {
      if (!this.isBrowser) return;

      if (!this.viewReady()) return;

      const el = this.mapContainer?.nativeElement;
      const lat = this.latitude();
      const lon = this.longitude();

      if (!el || lat == null || lon == null) return;

      loadLeaflet()
        .then((L) => {
          if (!this.map) {
            this.map = L.map(el, {
              zoomControl: false,
              attributionControl: false,
              scrollWheelZoom: false,
            });

            L.tileLayer(
              'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
              { attribution: 'Tiles © Esri', maxZoom: 16 }
            ).addTo(this.map);
          }

          this.map.setView([lat, lon], 16);

          if (this.glowOuter) this.map.removeLayer(this.glowOuter);
          if (this.glowInner) this.map.removeLayer(this.glowInner);
          if (this.marker) this.map.removeLayer(this.marker);

          this.glowOuter = L.circle([lat, lon], {
            color: '#6366f1',
            fillColor: '#6366f1',
            fillOpacity: 0.06,
            weight: 6,
            opacity: 0.12,
            radius: 220,
          }).addTo(this.map);

          this.glowInner = L.circle([lat, lon], {
            color: '#6366f1',
            fillColor: '#6366f1',
            fillOpacity: 0.18,
            weight: 2,
            opacity: 0.9,
            radius: 140,
          }).addTo(this.map);

          const customIcon = L.divIcon({
            className: 'custom-pulse-marker',
            html: `
              <div class="relative flex h-8 w-8">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-8 w-8 bg-indigo-600 border-4 border-indigo-900 shadow-[0_0_20px_rgba(99,102,241,0.6)]"></span>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          this.marker = L.marker([lat, lon], { icon: customIcon }).addTo(this.map);

          setTimeout(() => this.map?.invalidateSize(), 250);
        })
        .catch(() => {});
    });
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    this.viewReady.set(true);
  }
}
