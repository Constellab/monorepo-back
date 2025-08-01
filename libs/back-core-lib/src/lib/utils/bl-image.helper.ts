import imageSize from 'image-size';
import { ISizeCalculationResult } from 'image-size/dist/types/interface';

import { BlFile } from '../models/bl-file.class';

export class BlImageHelper {
  /**
   * Get width and height of an image
   */
  public static getImageSize(file: BlFile): ISizeCalculationResult {
    return imageSize(file.buffer);
  }
}
