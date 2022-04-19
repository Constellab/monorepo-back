export interface FlTextEditorUploadedImage {
  filename: string;
  width: number;
  height: number;
}

/**
 * Config for the text editor to retrieve the image from their names
 */
export interface FlTextEditorImageLoader {

  getImageUrl(filename: string): string;
}
