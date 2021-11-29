import {Params} from '@angular/router';
import {ClHelpService} from '@monorepo/core-lib';

/**
 * Use to store the advanced search values in the URL
 */
export interface FlAdvancedSearchObject {
  filtersCriteria: Record<string, any>;
}



export class FlSearchPageUrlHelper {

  /**
   * Method to convert search to query param for search page
   * @param mode search mode
   * @param search search criteria
   */
  public static getSearchPageQueryParams(mode: string, search: string): Params {
    return {mode: mode, search: search};
  }

  /**
   * Convert the advanced search object to string.
   * For object with id, only keep the id and remove others fields
   * @param advancedSearch
   */
  public static advancedSearchToString(advancedSearch: FlAdvancedSearchObject): string {
    const simpleFilters: Record<string, any> = {};

    const filters = advancedSearch.filtersCriteria;
    for (const key of Object.keys(filters)) {
      if (filters[key] == null) continue;


      if (typeof filters[key] === 'object') {
        // skip object where all values are null
        if (!ClHelpService.objectHasNonNullProperties(filters[key])) continue;

        if (filters[key].id !== undefined) {
          simpleFilters[key] = {id: filters[key].id};
          continue;
        }
      }

      simpleFilters[key] = filters[key];

    }

    return JSON.stringify({filtersCriteria: simpleFilters});
  }

  // parse and check if the search string from URL is a list of SearchCriteria for advanced search
  public static advancedSearchFromString(strSearch: string): FlAdvancedSearchObject | null {
    if (!strSearch) {
      return null;
    }

    let search: FlAdvancedSearchObject;
    try {
      search = JSON.parse(strSearch);
    } catch {
      return null;
    }

    // check that the search attributes are correctly set
    if (search && search.filtersCriteria) {
      return search;
    }
    return null;
  }

}
