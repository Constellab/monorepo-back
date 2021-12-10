import {FlEntity} from '../../../model/fl-entity.class';

/**
 * Interface representing a saved search
 */
export interface FlSavedSearch extends FlEntity {
  // name of the search form
  searchName: string;

  // label provided by the user
  label: string;

  // description provided by the user
  description?: string;

  // color provided by the user
  color: string;

  // if true, the search is triggered automatically
  default: boolean;

  // version of the search, must match the version of the form
  version: number;

  // object containing all the filters
  filtersCriteria: Record<string, any>;
}
