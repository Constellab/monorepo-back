import {Observable} from 'rxjs';


export abstract class FlTextEditorImageService {

  public abstract uploadImage(file: File): Observable<string>;

  public abstract deleteFile(filename: string): Observable<void>;
}
