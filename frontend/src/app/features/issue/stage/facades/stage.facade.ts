import { inject, Injectable, computed } from '@angular/core';
import { RecapFacade } from '../../../recap/facades/load.facade';

@Injectable({
  providedIn: 'root'
})
export class StageFacade {
  private recapFacade = inject(RecapFacade);

  // Expose signals for each specific statistic matching flat DTO response
  totalPending = computed(() => this.recapFacade.data()?.totalPending ?? 0);
  resolvedToday = computed(() => this.recapFacade.data()?.resolvedToday ?? 0);
  unresolvedToday = computed(() => this.recapFacade.data()?.unresolvedToday ?? 0);
  totalCategories = computed(() => this.recapFacade.data()?.totalCategory ?? 0);

  // Loading state
  loading = computed(() => this.recapFacade.loading());

  /**
   * Triggers a refresh of the underlying statistics recap
   */
  refresh() {
    this.recapFacade.loadRecap();
  }
}
