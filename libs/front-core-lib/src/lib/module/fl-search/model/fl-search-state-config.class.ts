import {InjectionToken} from '@angular/core';
import {FormGroup} from '@ngneat/reactive-forms';
import {FlSearchService} from './fl-search-service.class';
import {ClClassReference} from '@monorepo/core-lib';
import {FlSavedSearch} from './fl-saved-search.class';
import {FlFormInputsManagerConfig} from '../../fl-form-inputs-manager/fl-form-inputs-manager.class';

/**
 * Configuration object for the {@link FlSearchComponent}
 */
export interface FlSearchConfig {
  version: number;
  buildAdvancedForm: () => FormGroup; // method to create the advanced form group
  searchService: FlSearchService<any>;
  advancedFormClass: ClClassReference;
  savedSearch?: FlSavedSearch[];
  advancedSearchFormManagerConfig: FlFormInputsManagerConfig;
}

/**
 * Injection token to provide the SearchPageConfig
 */
export const FL_SEARCH_CONFIG =
  new InjectionToken<FlSearchConfig>('FL_SEARCH_CONFIG');
