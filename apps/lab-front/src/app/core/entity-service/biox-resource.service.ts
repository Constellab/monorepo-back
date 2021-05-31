import {Injectable} from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';
import {Observable, of} from 'rxjs';
import {BioxBasicResource, BioxResource} from '../model/entities/biox-resource.entity';
import {FileResourceService, FileWithContent} from './file-resource.service';
import {ClClassReference} from '@monorepo/core-lib';
import {FileResource} from '../model/entities/file-resource.entity';
import {map, mergeMap} from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class BioxResourceService {

  private readonly route: string = 'resource';

  constructor(private apiService: FlApiService,
              private fileResourceService: FileResourceService) {
  }

  public getByTypeAndId(type: string, id: string): Observable<BioxResource> {
    if (!type || !id) {
      return of(null);
    }

    if (type === 'gws.file.File') {
      return this.getFileResource(type, id);
    } else {
      return this.getResource(type, id, BioxBasicResource);
    }
  }

  private getResource(type: string, id: string, classReference: ClClassReference): Observable<any> {
    return this.apiService.get(`${this.route}/${type}/${id}`, classReference);
  }

  /**
   * Load FileResource and load file content
   */
  private getFileResource(type: string, id: string): Observable<FileResource> {
    return this.getResource(type, id, FileResource).pipe(
      mergeMap((fileResource: FileResource) => this.loadFileResourceContent(fileResource))
    );
  }

  /**
   * Load the content of a FileResource and set the result in data attribute
   */
  private loadFileResourceContent(file: FileResource): Observable<FileResource> {
    return this.fileResourceService.readFileFromResource(file).pipe(
      map((fileContent: FileWithContent) => {
        file.file = fileContent.file;
        file.data = fileContent.content;
        return file;
      })
    );
  }


}
