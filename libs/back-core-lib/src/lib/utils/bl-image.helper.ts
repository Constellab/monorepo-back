import { imageSize } from 'image-size';

import { BlFile } from '../models/bl-file.class';

export class BlImageHelper {
  /**
   * Get width and height of an image
   */
  public static getImageSize(file: BlFile): ReturnType<typeof imageSize> {
    return imageSize(file.buffer);
  }
}
