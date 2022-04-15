/**
 * Generic convert for search in lab entities
 */
export class LabSearchConverter {

  /**
   * If check, return null (meaning no filters)
   * If null or false, return false
   * @param checked
   */
  public static includeAllOnCheck(checked: boolean): boolean | null {
    if (!checked) {
      return false;
    } else {
      return null;
    }
  }
}
