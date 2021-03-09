export enum FlKeyboardKey {
  ENTER = 'Enter',
  ESCAPE = 'Escape',
  DELETE = 'Delete'
}

export class FlKeyboardHelper {

  public static keyboardKeyIsPrintable(key: string | FlKeyboardKey): boolean {
    return key?.length === 1 ?? false;
  }

  /**
   * return true if the key is pressed with control pressed
   * @param event
   * @param key
   */
  public static keyboardEventIsCtrlAndKey(event: KeyboardEvent, key: string | FlKeyboardKey): boolean {
    if (event == null || key == null) {
      return false;
    }
    return event.key === key && event.ctrlKey;
  }

  /**
   * return true if the key is pressed with alt pressed
   * @param event
   * @param key
   */
  public static keyboardEventIsAltAndKey(event: KeyboardEvent, key: string | FlKeyboardKey): boolean {
    if (event == null || key == null) {
      return false;
    }
    return event.key === key && event.altKey;
  }
}
