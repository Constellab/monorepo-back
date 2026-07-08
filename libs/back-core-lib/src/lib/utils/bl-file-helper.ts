import { Stream } from 'stream';

export class BlFileHelper {
  /**
   * @param file filename or full file path
   * @return return the filename name of a file without the extension
   */
  public static getFilenameWithoutExtension(file: string): string {
    if (!file) return '';
    return BlFileHelper.extractFilenameFromFullPath(file).split('.').slice(0, -1).join('.');
  }

  /**
   * @param file filename or full file path
   * @return the file extension without the .
   */
  public static getFileExtension(file: string): string {
    if (!file) return '';
    return BlFileHelper.extractFilenameFromFullPath(file).split('.').slice(-1).join('.');
  }

  /**
   * @param fullPath full path of the file
   * @return the filename of a path with the extension
   */
  public static extractFilenameFromFullPath(fullPath: string): string {
    // use a new RegExp otherwise the ngc build doesn't works
    const regex = new RegExp(/^.*[/]/);
    return fullPath.replace(regex, '');
  }

  public static isPDF(file: string): boolean {
    return BlFileHelper.extensionIsPDF(BlFileHelper.getFileExtension(file));
  }

  public static isWord(file: string): boolean {
    return BlFileHelper.extensionIsWord(BlFileHelper.getFileExtension(file));
  }

  public static isExcel(file: string): boolean {
    return BlFileHelper.extensionIsExcel(BlFileHelper.getFileExtension(file));
  }

  public static isImage(file: string): boolean {
    return BlFileHelper.extensionIsImage(BlFileHelper.getFileExtension(file));
  }

  public static extensionIsPDF(extension: string): boolean {
    return extension === 'pdf';
  }

  public static extensionIsWord(extension: string): boolean {
    return extension === 'doc' || extension === 'docx';
  }

  public static extensionIsExcel(extension: string): boolean {
    return extension === 'xls' || extension === 'xlsx';
  }

  public static extensionIsImage(extension: string): boolean {
    return (
      extension === 'png' ||
      extension === 'jpg' ||
      extension === 'jpeg' ||
      extension === 'gif' ||
      extension === 'webp' ||
      extension === 'svg'
    );
  }

  public static addIndexToFileName(file: string, index: number): string {
    const filename = BlFileHelper.getFilenameWithoutExtension(file);
    const extension = BlFileHelper.getFileExtension(file);
    return `${filename}_${index}.${extension}`;
  }

  public static convertFileStreamToBuffer(fileStream: Stream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Uint8Array[] = [];
      fileStream.on('data', (chunk: any) => {
        chunks.push(chunk);
      });
      fileStream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      fileStream.on('error', (error: any) => {
        reject(error instanceof Error ? error : new Error(String(error)));
      });
    });
  }
}
