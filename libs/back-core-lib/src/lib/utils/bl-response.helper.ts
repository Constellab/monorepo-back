import {Response} from 'express';
import {IncomingMessage} from 'http';
import {StreamableFile} from '@nestjs/common';

/**
 * Class to simplify HTTP response management
 */
export class BlResponseHelper {

  /**
   * Set an incoming message (like and image) in an HTTP response and cache it for a week
   */
  public static setMessageAndCache(response: Response, incomingMessage: IncomingMessage): void {
    this.setCacheHeaderFor1Week(response);
    this.setMessage(response, incomingMessage);
  }

  /**
   * Set an incoming message (like and image) in an HTTP response and cache it for a week
   */
  public static setMessage(response: Response, incomingMessage: IncomingMessage): void {
    incomingMessage.pipe(response);
  }

  /**
   * Mark the response to be cached for a week
   * @param response
   */
  public static setCacheHeaderFor1Week(response: Response): void {
    response.setHeader('Cache-Control', 'max-age=604800, public');
  }

  /**
   * Return a StreamableFile from an incoming message, useful to be downloaded by the client
   * @param incomingMessage
   */
  public static getFileResponse(incomingMessage: IncomingMessage) : StreamableFile{
    return new StreamableFile(incomingMessage);
  }
}
