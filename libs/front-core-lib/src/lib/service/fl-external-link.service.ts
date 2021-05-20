import {Injectable} from '@angular/core';

/**
 * Service to get external link (such as google scholar, wikipedia...)
 */
@Injectable({providedIn: 'root'})
export class FlExternalLinkService {


  /**
   * Get a search link for google scholar
   * @param search
   */
  public static getGoogleArchiveSearch(search: string): string {
    if (search == null) {
      return null;
    }

    // replace spaces with + and set to lower case for the search
    const searchParams: string = FlExternalLinkService.replaceSpacesWithPlus(search).toLowerCase();

    return `https://scholar.google.com/scholar?q=${searchParams}`;
  }

  public static getWikipediaSearch(search: string): string {
    if (search == null) {
      return null;
    }

    // replace spaces with + and set to lower case for the search
    const searchParams: string = FlExternalLinkService.replaceSpacesWithPlus(search).toLowerCase();

    return `https://fr.wikipedia.org/w/index.php?search=${searchParams}`;

  }

  private static replaceSpacesWithPlus(search: string): string {
    return search.replace(/\s+/g, '+');
  }
}
