import {Injectable} from '@angular/core';
import {FlApiService, FlTagService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {LabTagEntity} from '../model/entities/lab-tag.entity';

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

  public getAllTags(): Observable<LabTagEntity[]> {
    return this.apiService.get(this.route, LabTagEntity);
  }

  public createTag(tagKey: string, tagValue: string): Observable<LabTagEntity> {
    return this.apiService.post(`${this.route}/${tagKey}/${tagValue}`, LabTagEntity);
  }

  public updateTag(tagKey: string, oldTagValue: string, newTagValue: string): Observable<LabTagEntity> {
    return this.apiService.put(`${this.route}/${tagKey}/${oldTagValue}/${newTagValue}`, LabTagEntity);
  }

  public deleteTag(tagKey: string, tagValue: string): Observable<void> {
    return this.apiService.delete(`${this.route}/${tagKey}/${tagValue}`);
  }

  public reorderTags(tagKeys: string[]): Observable<LabTagEntity[]> {
    return this.apiService.put(`${this.route}/reorder`, tagKeys, LabTagEntity);
  }

  public reorderTagValues(tagKey: string, values: string[]): Observable<LabTagEntity> {
    return this.apiService.put(`${this.route}/${tagKey}/reorder`, values, LabTagEntity);
  }
}
