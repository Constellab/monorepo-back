/**
 * Generic convert for search in lab entities
 */
export class LabSearchConverter {

  /**
   * Search converter for archived checkbox. If check, return no filter (search on archived and not archived)
   * If null or false, only search on non archived objets
   * @param archived
   */
  public static convertArchived(archived: boolean): boolean | null {
    if (!archived) {
      return false;
    } else {
      return null;
    }
  }

  /**
   * Search converter for validated checkbox. If check, return no filter (search on validated and not validated)
   * If null or false, only search on non-validated objets
   * @param archived
   */
  public static convertValidated(archived: boolean): boolean | null {
    if (!archived) {
      return false;
    } else {
      return null;
    }
  }
}
