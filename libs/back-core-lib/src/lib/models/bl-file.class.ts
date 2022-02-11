/**
 * Type to use on uploaded file
 */
export interface BlFile {
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}
