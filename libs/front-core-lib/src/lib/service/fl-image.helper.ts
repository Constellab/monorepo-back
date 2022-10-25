export class FlImageHelper{
  constructor() {
  }

  /*
    Use this method to compress a blob:
    - blob is the blob to resize
    - resizeWidthMax is the maximum width of the compressed image
    - resizeHeightMax is the maximum height of the compressed image
    - cropWidth is the width of the image after the crop (default is resizeWidthMax)
    - cropHeight is the height of the image after the crop (default is resizeHeightMax)
   */
  public static async compressBlob(blob: Blob, resizeWidthMax: number, resizeHeightMax: number,
                                   cropWidth: number = resizeWidthMax, cropHeight: number = resizeHeightMax): Promise<Blob>{
    const blobUrl: string = URL.createObjectURL(blob);
    const loadImage = (url: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
      const img = new Image();
      img.addEventListener('load', () => resolve(img));
      img.addEventListener('error', (err) => reject(err));
      img.src = url;
    });
    const img = await loadImage(blobUrl);
    let [newWidth, newHeight] = FlImageHelper.calculateSize(img, resizeWidthMax, resizeHeightMax);
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    let xBegin: number = 0;
    let yBegin: number = 0;
    if (newWidth > cropWidth) {
      xBegin = Math.round((newWidth - cropWidth) / 2);
    } else {
      newWidth = cropWidth;
    }
    if (newHeight > cropHeight) {
      yBegin = Math.round((newHeight - cropHeight) / 2);
    } else {
      newHeight = cropHeight;
    }

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, -xBegin, -yBegin, newWidth, newHeight);
    return new Promise(resolve => canvas.toBlob(resolve));
  }

  // Calculate the size of the compressed image
  public static calculateSize(img: HTMLImageElement, maxH: number, maxW: number): [number, number] {
    let width: number = img.width;
    let height: number = img.height;

    if (width > height) {
      if (width > maxW) {
        height = Math.round((height * maxW) / width);
        width = maxW;
      }
    } else {
      if (height > maxH) {
        width = Math.round((width * maxH) / height);
        height = maxH;
      }
    }
    return [width, height];
  }
}
