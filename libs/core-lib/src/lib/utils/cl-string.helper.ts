/**
 * Helper class with only static methods to simplify String management
 */
export class ClStringHelper {

  /**
   * Replace all the accent in a string with the corresponding letter
   *
   * 'é' will be replaced with 'e'
   * @param str string with accent
   */
  public static removeAccentFromString(str: string): string {
    // see https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
    // the normalize convert the é to e' and the replace remove the ' characters
    // use a new RegExp otherwise the ngc build doesn't works
    const regex = new RegExp(/[\u0300-\u036f]/g);
    return str.normalize('NFD').replace(regex, '');
  }


  /**
   * Trim a string and replace duplicate spaces with one space
   * @param str string
   */
  public static trimAndRemoveDuplicateSpaces(str: string): string {
    // use a new RegExp otherwise the ngc build doesn't works
    const regex = new RegExp(/\s+/, 'g');
    // trim and then replace all spaces with one space
    return str.trim().replace(regex, ' ');
  }

  /**
   * Return true if the input string is an http link.
   * If it starts with https:// or http://
   * @param str string
   */
  public static isHttpLink(str: string): boolean {
    return str.substring(0, 8) === 'https://' || str.substring(0, 7) === 'http://';
  }

  /**
   * Convert Test hello --> test-hello
   * @param str
   */
  public static toKebabCase(str: string): string {
    if (str == null) return null;
    return str.trim().replace(/\s+/g, '-').toLowerCase();
  }

  /**
   * Return true if the input string is an email
   * It checks if the string contains a @ and a .
   * @param str
   */
  public static isEmail(str: string): boolean {
    return str.includes('@') && str.split('@')[1].includes('.');
  }

  /**
   * Generate an UUID v4, it is not a simple uuid ID and must not used for encryption
   */
  public static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Return true if the input string is a valid UUID v4
   */
  public static isUUID(str: string): boolean {
    const regex = new RegExp(/^[a-f\d]{8}(-[a-f\d]{4}){4}[a-f\d]{8}$/i);
    return regex.test(str);
  }

  /**
   * Return all the indexes of the search str in str
   * From: https://stackoverflow.com/questions/3410464/how-to-find-indices-of-all-occurrences-of-one-string-in-another-in-javascript
   * @param searchStr sub string to search in str
   * @param str
   * @param caseSensitive
   */
  public static getIndicesOf(searchStr: string, str: string, caseSensitive: boolean = false): number[] {
    const searchStrLen = searchStr.length;
    if (searchStrLen == 0) {
      return [];
    }
    let startIndex = 0;
    let index = 0;
    const indices = [];
    if (!caseSensitive) {
      str = str.toLowerCase();
      searchStr = searchStr.toLowerCase();
    }
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
      indices.push(index);
      startIndex = index + searchStrLen;
    }
    return indices;
  }

  /**
   * Return the lowest domain of an url
   * Example : https://google.com --> google
   * Example : https://test.constellab.com --> test
   * @param url
   */
  public static getLowestDomainFromUrl(url: string): string {
    if (url == null) return null;
    url = url.replace('https://', '')
      .replace('http://', '');
    const domains = url.split('.');
    if (domains.length < 2) return null;
    return domains[0];
  }

  /**
   * Return the string with line breaks replaced by a point with a space
   */
  public static replaceLineBreaksBySpace(str: string): string {
    if (str == null) return null;

    str = str.replace(/(?:\r\n|\r|\n)/g, ' ');

    return str;
  }

  /**
   * Generate an url path from a string. It replaces spaces with dashes and remove all special characters
   */
  public static generateUrlPathFromString(str: string): string {
    if (str == null) return '';

    // replace all white spaces with dash
    return ClStringHelper.trimAndRemoveDuplicateSpaces(str).toLowerCase()
    // remove all special characters
      .replace(new RegExp(/[&?~/|\\'"[()\]%!§:;.,*^¨}{@°`]/g), '')
      // replace all spaces with dashes
      .replace(/\s+/g, '-')
      // remove all double or more dashes with one dash
      .replace(/-+/g, '-')
      // remove all dashes at the beginning and at the end
      .replace(/^[- ]+|[- ]+$/g, '');
  }
}
