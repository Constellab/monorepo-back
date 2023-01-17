import {Injectable} from '@angular/core';
import {FlApiService, FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {HaCreateStoryDto, HaStory, HaStoryDatasourcePaginated} from '../ha-model/ha-entities/ha-story.class';
import {Observable} from 'rxjs';
import {ClPage} from '@monorepo/core-lib';


@Injectable({
  providedIn: 'root'
})
export class HaStoryService {
  private readonly route: string = 'story';

  constructor(private apiService: FlApiService) {

  }

  /**
   * Call http post to create a story
   * @param object story to create
   * return a story
   */
  public create(object: HaCreateStoryDto): Observable<HaStory> {
    return this.apiService.post(this.route, object, HaCreateStoryDto);
  }

  /**
   * Call http get to get all stories paginated
   * @param id id of the story
   * return a story
   */
  public getById(id: string): Observable<HaStory> {
    return this.apiService.getById(this.route, id, HaStory);
  }

  /**
   * Call http get to get all stories paginated
   * @param page page number
   * @param size page size
   * return a list of stories paginated
   */
  public getAll(page: number, size: number): Observable<ClPage<HaStory>> {
    return this.apiService.get(this.route, HaStory, {page: page, pageSize: size, resultIsPaginated: true});
  }

  public getAllPaginated(): HaStoryDatasourcePaginated {
    return new FlEntityPaginatedDatasource(
      (page, size) => this.getAll(page, size), 10);
  }

  /**
   * Call http get to get all stories paginated
   * @param page page number
   * @param size page size
   * @param topicId topic id
   * return a list of stories paginated
   */
  public getAllByTopicId(page: number, size: number, topicId: string): Observable<ClPage<HaStory>> {
    return this.apiService.get(this.route + '/topic/' + topicId, HaStory, {
      page: page,
      pageSize: size,
      resultIsPaginated: true
    });
  }

  public getAllByTopicIdPaginated(topicId: string): HaStoryDatasourcePaginated {
    return new FlEntityPaginatedDatasource(
      (page, size) => this.getAllByTopicId(page, size, topicId), 10);
  }
}
