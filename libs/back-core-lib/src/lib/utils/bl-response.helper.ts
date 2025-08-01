import { StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { IncomingMessage } from 'http';
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

  /**
   * Set an incoming message (like and image) in an HTTP response
   */
  public static setMessage(response: Response, incomingMessage: IncomingMessage): void {
    response.setHeader('Content-Type', incomingMessage.headers['content-type']);
    response.setHeader('Content-Length', incomingMessage.headers['content-length']);
    incomingMessage.pipe(response);
  }

  /**
   * Set file response headers, pipe the file to the response, and cache it for a week
   * @param response The Express response object
   * @param file The file response object
   * @param mode The mode of the response, either 'download' or 'preview'
   */
  public static setFileResponseAndCache(
    response: Response,
    file: BlFileResponse,
    mode: 'download' | 'preview' = 'download'
  ): void {
    this.setCacheHeaderFor1Week(response);
    this.setFileResponse(response, file, mode);
  }

  /**
   * Set file response headers and pipe the file to the response
   * @param response The Express response object
   * @param file The file response object
   * @param mode The mode of the response, either 'download' or 'preview'
   */
  public static setFileResponse(
    response: Response,
    file: BlFileResponse,
    mode: 'download' | 'preview' = 'download'
  ): void {
    response.setHeader('Content-Type', file.contentType);
    response.setHeader('Content-Length', file.contentLength);

    if (file.name) {
      const disposition = mode === 'download' ? 'attachment' : 'inline';
      const encodedFilename = encodeURIComponent(file.name);
      response.setHeader('Content-Disposition', `${disposition}; filename*=UTF-8''${encodedFilename}`);
    }

    file.file.pipe(response);
  }

  public static setFileResponseFromStr(
    response: Response,
    content: string,
    fileName: string,
    contentType: string
  ): void {
    response.setHeader('Content-Type', contentType);
    const encodedFilename = encodeURIComponent(fileName);
    response.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}`);
    response.send(content);
  }

  /**
   * Mark the response to be cached for a week
   * @param response
   */
  public static setCacheHeaderFor1Week(response: Response): void {
    response.setHeader('Cache-Control', 'max-age=604800, public');
  }

  /**
   * Return a StreamableFile from a string, useful to be downloaded by the client
   */
  public static streamableFileFromString(fileContent: string): StreamableFile {
    const readableStream = new Readable();
    readableStream.push(fileContent);
    readableStream.push(null); // indicates end of file

    // create a StreamableFile from the Readable Stream
    return new StreamableFile(readableStream);
  }
}
