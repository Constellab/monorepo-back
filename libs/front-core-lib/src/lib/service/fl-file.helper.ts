import {Observable} from 'rxjs';

/**
 * Helper to manage files, like download a file
 */
export class FlFileHelper {

  constructor() {
  }

  /////////////////////////////////////////// STRING //////////////////////////////////////////////


  /**
   * @param file filename or full file path
   * @return return the filename name of a file without the extension
   */
  public static getFilenameWithoutExtension(file: string): string {
    if (!file) return null;
    return FlFileHelper.extractFilenameFromFullPath(file)
      .split('.')
      .slice(0, -1)
      .join('.');
  }

  /**
   * @param file filename or full file path
   * @return the file extension without the .
   */
  public static getFileExtension(file: string): string {
    if (!file) return null;
    return FlFileHelper.extractFilenameFromFullPath(file)
      .split('.')
      .slice(-1)
      .join('.');
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
    return FlFileHelper.extensionIsPDF(FlFileHelper.getFileExtension(file));
  }

  public static isWord(file: string): boolean {
    return FlFileHelper.extensionIsWord(FlFileHelper.getFileExtension(file));
  }

  public static isExcel(file: string): boolean {
    return FlFileHelper.extensionIsExcel(FlFileHelper.getFileExtension(file));
  }

  public static isImage(file: string): boolean {
    return FlFileHelper.extensionIsImage(FlFileHelper.getFileExtension(file));
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
    return extension === 'png' || extension === 'jpg' || extension === 'jpeg' ||
      extension === 'gif' || extension === 'webp' || extension === 'svg';
  }

  /////////////////////////////////////////// JS FILE //////////////////////////////////////////////
  /**
   * Convert a {@link FileList} to File[]
   * @param files fileList
   */
  public static convertFileListToArray(files: FileList): File[] {
    const array: File[] = [];
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < files.length; i++) {
      array.push(files[i]);
    }

    return array;
  }


  public static isFolder(file: File): boolean {
    // not perfect, this also detect empty file without extension as folder
    return !file.type && file.size === 0;
  }


  /////////////////////////////////////////// BLOB //////////////////////////////////////////////

  public static createBlob(blobParts?: BlobPart[], options?: BlobPropertyBag): Blob {
    return new Blob(blobParts, options);
  }

  /**
   * Read the content of a blob file
   * @param file
   * @param parseResultToJson if true parse the result to json
   */
  public static readBlobContent(file: Blob, parseResultToJson: boolean = false): Observable<string | any> {
    return new Observable(subscriber => {
      const reader = new FileReader();

      // This fires after the blob has been read/loaded.
      reader.addEventListener('loadend', (e) => {
        const result: string = e.target.result as any;
        if (parseResultToJson) {
          try {
            subscriber.next(JSON.parse(result));
          } catch (e) {
            subscriber.error(e);
            return;
          }
        } else {
          subscriber.next(result);
        }

        subscriber.complete();
      });

      // Start reading the blob as text.
      reader.readAsText(file);
    });
  }


  // /**
  //  * @param fullPath full path of the file
  //  * @return the directory of the file of a path with the extension
  //  */
  // public static extractDirectoryFromFullPath(fullPath: string): string {
  //   // use a new RegExp otherwise the ngc build doesn't works
  //   const regex = new RegExp(/(.*)[\/\\]/);
  //   return fullPath.match(regex)[1] ?? '';
  // }

  /**
   * Download a file to the user's computer
   * @param file the blob file to download
   * @param filename the complete name of the file
   */
  public static downloadBlob(file: Blob, filename: string): void {
    if (window.navigator.msSaveOrOpenBlob) { // IE10+
      window.navigator.msSaveOrOpenBlob(file, filename);
    } else { // Others
      // create an <a> tag to download the file
      const a = document.createElement('a');
      const url = URL.createObjectURL(file);

      a.href = url;
      a.download = filename;
      document.body.appendChild(a);

      // trigger a click event on the tag
      a.click();

      // clear elements
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
    }

  }

  /**
   * This convert a base64 file to a blob and then download it to the user's computer
   * @param b64Data  base 64 string
   * @param filename the complete name of the file
   * @param contentType content type of the blob
   */
  public static downloadBase64File(b64Data: string, filename: string, contentType = 'application/json'): void {
    // convert to base 64
    const blob: Blob = FlFileHelper.convertBase64ToBlob(b64Data, contentType);

    // download the file
    this.downloadBlob(blob, filename);
  }

  /**
   * Convert a base 64 string to a blob.
   * Code from https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
   * @param b64Data base 64 string
   * @param contentType content type of the blob
   */
  public static convertBase64ToBlob(b64Data: string, contentType = 'application/json'): Blob {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
    const sliceSize: number = 512;

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, {type: contentType});
  }


  /**
   * Convert a json to blob and download it to the user's computer
   * @param json object
   * @param filename the complete name of the file
   */
  public static downloadJsonFile(json: any, filename: string): void {
    // convert to base 64
    const blob: Blob = FlFileHelper.convertJsonToBlob(json);

    // download the file
    this.downloadBlob(blob, filename);
  }

  /**
   * Convert a json to a blob.
   * @param json object
   */
  public static convertJsonToBlob(json: any): Blob {
    const str = JSON.stringify(json);

    const bytes = new TextEncoder().encode(str);
    return new Blob([bytes], {
      type: 'application/json;charset=utf-8'
    });
  }
}
