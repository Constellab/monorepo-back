import { BlFileResponse } from '@monorepo/back-core-lib';
import * as JSZip from 'jszip';
import { ClStringHelper } from '@monorepo/core-lib';
import { Readable } from 'stream';

export interface HnMarkdownFile {
  name: string;
  content: string;
}

export class HnZipHelper {
  public static async markdownsToZipFile(
    markdowns: HnMarkdownFile[],
    fileName: string
  ): Promise<BlFileResponse> {
    const zip = new JSZip();
    markdowns.forEach((markdown, index) => {
      zip.file(`${ClStringHelper.getCleanUrlPath(markdown.name)}.md`, markdown.content);
    });
    const zipContent = await zip.generateAsync({ type: 'nodebuffer' });
    const stream = Readable.from(zipContent);

    return {
      name: `${fileName}.zip`,
      file: stream,
      contentType: 'application/zip',
      contentLength: zipContent.length,
    } as BlFileResponse;
  }
}
