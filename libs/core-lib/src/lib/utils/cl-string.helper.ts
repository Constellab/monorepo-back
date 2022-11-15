/**
 * Helper class with only static methods to simplify String management
 */
export class ClStringHelper {
  /**
   * Method to check if the string container contain the partialString
   * @param container the string container
   * @param partialString string to check if it's in the container
   * @param trim if true, the strings are trimmed
   * @param toLowerCase if true, the string are converted to lower case for comparison
   * @param replaceAccent if false the accent are replace by the letter (an 'é' equals 'e')
   */
  public static stringContains(container: string, partialString: string, trim: boolean = true,
                               toLowerCase: boolean = true, replaceAccent: boolean = false): boolean {
    if (container == null || partialString == null ||
      typeof container !== 'string' || typeof partialString !== 'string') {
      return false;
    }

    let containerStr: string = container;
    let partialStr: string = partialString;

    if (trim) {
      containerStr = containerStr.trim();
      partialStr = partialStr.trim();
    }

    if (toLowerCase) {
      containerStr = containerStr.toLowerCase();
      partialStr = partialString.toLowerCase();
    }

    if (replaceAccent) {
      containerStr = this.removeAccentFromString(containerStr);
      partialStr = this.removeAccentFromString(partialStr);
    }

    return containerStr.indexOf(partialStr) !== -1;
  }

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
   * Remove all the whitespace from a string
   * @param str string
   */
  public static removeAllWhitespaceFromString(str: string): string {
    // use a new RegExp otherwise the ngc build doesn't works
    const regex = new RegExp(/\s/g);
    return str.replace(regex, '');
  }

  /**
   * Remove all the instance of characters (or substring) from a string
   * @param str string
   * @param charToRemove list of characters (or substring) to remove
   */
  public static removeCharactersFromString(str: string, charToRemove: string[]): string {
    // use a new RegExp otherwise the ngc build doesn't works
    const regex = new RegExp(`[${charToRemove.join()}]`, 'g');
    return str.replace(regex, '');
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
   * Capitalize a string
   *
   * Example 'hello' --> 'Hello'
   * @param str string to capitalize
   */
  public static capitalize(str: string): string {
    if (str == null || str.length === 0) {
      return str;
    }

    return str[0].toUpperCase() + str.substring(1).toLowerCase();
  }

  /**
   * Capitalize every word of a string
   *
   * Example 'hello michael' --> 'Hello Michael'
   * @param str string to capitalize
   */
  public static capitalizeAllWords(str: string): string {
    if (str == null || str.length === 0) {
      return str;
    }

    // split the string on spaces
    const strList = str.split(' ');

    // capitalize each words
    return strList.map((s) => ClStringHelper.capitalize(s)).join(' ');
  }

  /**
   * Simple method to create a regex with a string
   * It escape the special regex characters if the regex needs to match it
   * @param str special regex characters to escape (or normal characters, it will be ignored)
   */
  public static regexEscapeCharacters(str: string): string {
    const regex = new RegExp(/[-/\\^$*+?.()|[\]{}]/gi);
    return str.replace(regex, '\\$&');
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

  public static replaceAt(str: string, index: number, replacementLength: number, replacement: string): string {
    return str.substring(0, index) + replacement + str.substring(index + replacementLength);
  }

  /**
   * Limit length of a string a complete with '...'
   */
  public static limiteLength(str: string, length: number): string {
    if (!str) return str;

    if (typeof str !== 'string') {
      str = (str as any).toString();
    }

    if (str.length <= length) return str;
    // when stripping, remove few more characters so the '...' doesn't not overlap
    return str.substring(0, length - 3) + '...';
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
   * Return the lowest domain of an url
   * Example : https://google.com --> google
   * Example : https://test.constellab.com --> test
   * @param url
   */
  public static getLowestDomainFromUrl(url: string): string {
    if(url == null) return null;
    url = url.replace('https://', '')
      .replace('http://', '');
    const domains = url.split('.');
    if(domains.length < 2) return null;
    return domains[0];
  }


  /**
   * Return a valid id/string for url parameters
   * @param str
   */
  public static toIdForUrl(str: string): string{
    str = str.replace(new RegExp(/[&?~/|\\'"[()\]%!§:;.,*^¨}{@°`]/g), '');
    str.replace('--', '-');
    while(str[0] == '-'){
      str = str.slice();
    }

    while (str[str.length-1] == '-'){
      str = str.slice(0, -1);
    }

    return str;
  }
}
