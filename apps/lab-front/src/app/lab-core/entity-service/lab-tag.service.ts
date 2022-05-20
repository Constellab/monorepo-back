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
}
