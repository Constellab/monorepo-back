/**
 * Helper class with only static methods to simplify Number management
 */
export class ClNumberHelper {

  /**
   * convert a string to a number. It support the ',' and scientific notation, it also remove weird character
   * @param str
   * @param defaultValue if provided, it returns the value if we couldn't convert the string to number
   *                      If not provided it returns null
   */
  public static fromString(str: string | number, defaultValue: number = null): number {
    if (typeof str === 'number') {
      return str;
    }

    if (str == null || str.length === 0) {
      return defaultValue;
    }

    const regex = new RegExp(/\s+/, 'g');

    // remove the white space and replace ',' with '.'
    const cleanStr = str.replace(regex, '').replace(',', '.');
    const number = Number(cleanStr);

    if (isNaN(number)) {
      return defaultValue;
    } else {
      return number;
    }
  }

  /**
   * Method useful to round nb with a certain amount of decimals
   * @param num
   * @param nbDecimals
   */
  public static round(num: number, nbDecimals: number = 0): number {
    if (typeof num != 'number' || typeof nbDecimals != 'number') return num;

    const rounder = 10 ** nbDecimals;
    return Math.round((num + Number.EPSILON) * rounder) / rounder;
  }

  /**
   * Return the number or min or max if number is outside the interval
   * @param number
   * @param min
   * @param max
   */
  public static between(number: number, min: number, max: number): number {
    return Math.min(Math.max(number, min), max);
  }
}
