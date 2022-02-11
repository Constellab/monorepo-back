import {Observable} from 'rxjs';

export interface FlTextEditorUploadedImage {
  url: string;
  width: number;
  height: number;
}

export abstract class FlTextEditorImageService {

  public abstract uploadImage(file: File): Observable<FlTextEditorUploadedImage>;

  public abstract deleteImage(filename: string): Observable<void>;
}
