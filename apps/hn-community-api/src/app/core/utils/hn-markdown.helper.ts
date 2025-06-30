import { Readable } from 'stream';
import { BlFileResponse } from '@monorepo/back-core-lib';

export class HnMarkdownHelper {
  public static createMarkdownResponse(fileName: string, markdownContent: string): BlFileResponse {
    const buffer = Buffer.from(markdownContent, 'utf-8');

    const stream = Readable.from(buffer);
    return {
      name: fileName,
      file: stream,
      contentType: 'text/markdown',
      contentLength: buffer.length,
    };
  }
}
