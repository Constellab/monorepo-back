import { BlFile } from '../models/bl-file.class';
import imageSize from 'image-size';
import { ISizeCalculationResult } from 'image-size/dist/types/interface';

export class BlImageHelper {
  /**
   * Get width and height of an image
   */
  public static getImageSize(file: BlFile): ISizeCalculationResult {
    return imageSize(file.buffer);
  }
}
