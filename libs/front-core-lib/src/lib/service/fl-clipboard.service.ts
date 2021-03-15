import {Injectable} from '@angular/core';
import {Clipboard} from '@angular/cdk/clipboard';

/**
 * Service to manage clipboard
 */
@Injectable({providedIn: 'root'})
export class FlClipboardService {


  constructor(private clipboard: Clipboard) {
  }

  /**
   * Copies the provided text into the user's clipboard.
   * Params: text – The string to copy.
   * Returns:Whether the operation was successful.
   */
  public copy(text: string): boolean {
    return this.clipboard.copy(text);
  }

  /**
   * returns the copied text
   */
  public readText(): Promise<string | null> {
    if (navigator.clipboard) {
      return navigator.clipboard.readText();
    } else {
      return Promise.resolve() as Promise<null>;
    }
  }
}
