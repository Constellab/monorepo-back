import {FormGroup} from '@ngneat/reactive-forms';
import {ClClassReference, ClPageI} from '@monorepo/core-lib';
import {FlSavedSearch} from './fl-saved-search.class';
import {FlFormInputsManagerConfig} from '../../fl-form-inputs-manager/fl-form-inputs-manager.class';
import {Observable} from 'rxjs';

/**
 * Configuration object for the {@link FlSearchComponent}
 */
export interface FlSearchConfig {
  version: number;
  buildAdvancedForm: () => FormGroup; // method to create the advanced form group
  searchFunc: FLSearchFunction;
  advancedFormClass: ClClassReference;
  savedSearch?: FlSavedSearch[];
  advancedSearchFormManagerConfig: FlFormInputsManagerConfig;
  storeSearchInUrl: boolean; // if true the url is modified when a search is made
}

/**
 * Search function
 */
export type FLSearchFunction<T = any> = (page: number, pageSize: number, filters: any) => Observable<ClPageI<T>>

