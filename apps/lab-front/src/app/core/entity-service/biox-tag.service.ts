import {Injectable} from '@angular/core';
import {FlApiService, FlTag, FlTagService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {BioxTag, BioxTagEntity} from '../model/entities/biox-tag.entity';

@Injectable({
  providedIn: 'root'
})
export class BioxTagService extends FlTagService {

  private readonly route: string = 'tag';

  constructor(private apiService: FlApiService) {
    super();
  }

  public searchTag(key: string): Observable<BioxTagEntity[]> {
    return this.apiService.get(`${this.route}/${key}`, BioxTagEntity);
  }

  public saveTags(typingName: string, id: string, tags: FlTag[]): Observable<BioxTag[]> {
    return this.apiService.put(`${this.route}/save/${typingName}/${id}`, tags, BioxTag);
  }
}
