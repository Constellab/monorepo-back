import {Injectable} from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';
import {HaTopicDto} from '../ha-model/ha-entities/ha-topic.class';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HaTopicService {

  private readonly route: string = 'topic';

  constructor(private apiService: FlApiService) {

  }

  public getAll(): Observable<HaTopicDto[]> {
    return this.apiService.get(this.route);
  }

  public getPopularTopics(): Observable<HaTopicDto[]> {
    return this.apiService.get(this.route + '/popular');
  }
}
