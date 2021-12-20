import {Injectable} from '@angular/core';
import {FlApiService, FlTag, FlTagService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {LabTag, LabTagEntity} from '../model/entities/lab-tag.entity';

@Injectable({
  providedIn: 'root'
})
export class LabTagService extends FlTagService {

  private readonly route: string = 'tag';

  constructor(private apiService: FlApiService) {
    super();
  }

  public searchTag(key: string): Observable<LabTagEntity[]> {
    return this.apiService.get(`${this.route}/${key}`, LabTagEntity);
  }

  public saveTags(typingName: string, id: string, tags: FlTag[]): Observable<LabTag[]> {
    return this.apiService.put(`${this.route}/save/${typingName}/${id}`, tags, LabTag);
  }
}
