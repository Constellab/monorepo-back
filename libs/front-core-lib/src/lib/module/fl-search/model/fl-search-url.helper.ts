import {ClHelpService} from '@monorepo/core-lib';

/**
 * Use to store the advanced search values in the URL
 */
export interface FlAdvancedSearchObject {
  filtersCriteria: Record<string, any>;
}

/**
 * Object stored in the url to save the search
 */
export interface FlSearchUrlObject {
  mode: string;
  search: string;
  timestamp: string;
}

export class FlSearchPageUrlHelper {

  /**
   * Method to convert search to query param for search page
   * @param mode search mode
   * @param search search criteria
   * @param timestamp of the search
   */
  public static buildSearchUrlObject(mode: string, search: string, timestamp: string): FlSearchUrlObject {
    return {mode: mode, search: search, timestamp: timestamp};
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

      if (Array.isArray(filters[key])) {
        simpleFilters[key] = filters[key].map((item: any) => this.advancedSearchObjectToString(item));
      } else if (typeof filters[key] === 'object') {
        simpleFilters[key] = this.advancedSearchObjectToString(filters[key]);
      } else {
        simpleFilters[key] = filters[key];
      }
    }

    return JSON.stringify({filtersCriteria: simpleFilters});
  }

  private static advancedSearchObjectToString(obj: Record<any, any>): Record<any, any> {
    // skip object where all values are null
    if (!ClHelpService.objectHasNonNullProperties(obj)) return obj;

    if (obj.id !== undefined) {
      return {id: obj.id};
    }

    return obj;
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
