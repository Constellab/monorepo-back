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
    if (search == null) return null;

    // replace spaces with + and set to lower case for the search
    const searchParams: string = FlExternalLinkService.replaceSpacesWithPlus(search).toLowerCase();

    return `https://scholar.google.com/scholar?q=${searchParams}`;
  }

  public static getWikipediaSearch(search: string): string {
    if (search == null) return null;

    // replace spaces with + and set to lower case for the search
    const searchParams: string = FlExternalLinkService.replaceSpacesWithPlus(search).toLowerCase();

    return `https://fr.wikipedia.org/w/index.php?search=${searchParams}`;
  }


  /**
   * Get the link of a reaction from Rhea database
   * @param rheaId formatted as RHEA:12345 or 12345
   */
  public static getRheaDatabaseReactionLink(rheaId: string): string {
    if (rheaId == null) return null;

    // replace spaces with + and set to lower case for the search
    const cleanId: string = rheaId.replace('RHEA:', '');

    return `https://www.rhea-db.org/rhea/${cleanId}`;
  }

  /**
   * Get the link of a metabolite from Rhea database
   * @param chebi formatted as CHEBI:12345
   */
  public static getChebiLink(chebi: string): string {
    if (chebi == null) return null;
    return `https://www.ebi.ac.uk/chebi/searchId.do?chebiId=${chebi}`;
  }

  /**
   * Get the link of a reaction in Brenda from the ec number
   * @param ecNumber formatted as 1.2.3.11
   */
  public static getBrendaLink(ecNumber: string): string {
    if (ecNumber == null) return null;
    return `https://www.brenda-enzymes.org/enzyme.php?ecno=${ecNumber}`;
  }


  private static replaceSpacesWithPlus(search: string): string {
    return search.replace(/\s+/g, '+');
  }
}
