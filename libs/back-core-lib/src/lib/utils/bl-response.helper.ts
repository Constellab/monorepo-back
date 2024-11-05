import { Response } from 'express';
import { IncomingMessage } from 'http';
import { StreamableFile } from '@nestjs/common';
import { Readable } from 'stream';
import { BlFileResponse } from '../modules/bl-object-storage/bl-object-storage.class';

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

  public static setFileResponseAndCache(response: Response, file: BlFileResponse): void {
    this.setCacheHeaderFor1Week(response);
    this.setFileResponse(response, file);
  }

  public static setFileResponse(response: Response, file: BlFileResponse): void {
    response.setHeader('Content-Type', file.contentType);
    response.setHeader('Content-Length', file.contentLength);
    file.file.pipe(response);
  }

  /**
   * Set an incoming message (like and image) in an HTTP response and cache it for a week
   */
  public static setMessage(response: Response, incomingMessage: IncomingMessage): void {
    response.setHeader('Content-Type', incomingMessage.headers['content-type']);
    response.setHeader('Content-Length', incomingMessage.headers['content-length']);
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
  public static getFileResponse(incomingMessage: Readable): StreamableFile {
    return new StreamableFile(incomingMessage);
  }

  /**
   * Return a StreamableFile from a string, useful to be downloaded by the client
   */
  public static fileResponseFromString(fileContent: string): StreamableFile {
    const readableStream = new Readable();
    readableStream.push(fileContent);
    readableStream.push(null); // indicates end of file

    // create a StreamableFile from the Readable Stream
    return new StreamableFile(readableStream);
  }
}
