import { BlFileResponse } from '@monorepo/back-core-lib';
import { ClStringHelper } from '@monorepo/core-lib';
import * as JSZip from 'jszip';
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
    markdowns.forEach((markdown) => {
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

  public static async markdownStringToMarkdownFile(
    markdownString: string,
    fileName: string
  ): Promise<HnMarkdownFile> {
    return {
      name: ClStringHelper.getCleanUrlPath(fileName),
      content: markdownString,
    } as HnMarkdownFile;
  }
}
