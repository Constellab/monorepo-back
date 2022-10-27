import {Response} from 'express';
import {IncomingMessage} from 'http';

/**
 * Class to simplify HTTP response management
 */
export class BlResponseHelper {

  /**
   * Set an incoming message (like and image) in an HTTP response and cache it for a week
   */
  public static setMessageAndCache(response: Response, incomingMessage: IncomingMessage): void {
    this.setCacheHeaderFor1Week(response);
    incomingMessage.pipe(response);
  }

  /**
   * Mark the response to be cached for a week
   * @param response
   */
  public static setCacheHeaderFor1Week(response: Response): void {
    response.setHeader('Cache-Control', 'max-age=604800, public');
  }
}
