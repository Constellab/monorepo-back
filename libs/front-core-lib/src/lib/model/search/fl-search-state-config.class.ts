import {InjectionToken} from '@angular/core';
import {FormGroup} from '@ngneat/reactive-forms';
import {FlSearchService} from './fl-search-service.class';
import {ClClassReference} from '@monorepo/core-lib';

/**
 * Configuration object for the {@link FlSearchState}
 */
export interface FlSearchPageConfig {
  buildAdvancedForm: () => FormGroup; // method to created the advanced form group
  searchService: FlSearchService<any>;
  advancedFormClass: ClClassReference;
}

/**
 * Injection token to provide the SearchPageConfig
 */
export const FL_SEARCH_PAGE_CONFIG =
  new InjectionToken<FlSearchPageConfig>('FL_SEARCH_PAGE_CONFIG');
