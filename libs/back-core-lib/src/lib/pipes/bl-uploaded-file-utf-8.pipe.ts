import { Injectable, PipeTransform, UploadedFile, UploadedFiles } from '@nestjs/common';

import { BlFile } from '../models/bl-file.class';

/**
 * Pip to force the original name of an uploaded file to UTF-8
 * It fixes the UTF-8 encoding issue of multer
 * Solution from https://github.com/expressjs/multer/issues/1104#issuecomment-1152987772
 */
@Injectable()
export class BlUploadedFileUtf8Pipe implements PipeTransform {
  transform(file: BlFile | BlFile[] | null): BlFile | BlFile[] | null {
    if (file == null) return null;

    if (Array.isArray(file)) {
      for (let i = 0; i < file.length; i++) {
        if (file[i].originalname) {
          file[i].originalname = Buffer.from(file[i].originalname, 'latin1').toString('utf8');
        }
      }
    } else {
      if (file.originalname) {
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
      }
    }

    return file;
  }
}

/**
 * Wrapper around the UploadedFile decorator to force the original name of an uploaded file to UTF-8
 * @constructor
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function BlUploadedFile(): ParameterDecorator {
  return UploadedFile(BlUploadedFileUtf8Pipe);
}

/**
 * Wrapper around the UploadedFiles decorator to force the original name of an uploaded file to UTF-8
 * @constructor
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function BlUploadedFiles(): ParameterDecorator {
  return UploadedFiles(BlUploadedFileUtf8Pipe);
}
