import {Injectable} from '@angular/core';
import {FlApiService, FlEntityPaginatedDatasource, FlTextEditorUploadedImage} from '@monorepo/front-core-lib';
import {
  HaCreateStoryDto,
  HaListStoryDto,
  HaMyStoriesDataSource,
  HaStory,
  HaStoryDataSourceDataDto,
  HaStoryDatasourcePaginated, HaStoryFilter
} from '../ha-model/ha-entities/ha-story.class';
import {Observable} from 'rxjs';
import {ClPage} from '@monorepo/core-lib';
import {CmRichTextI} from '@monorepo/common-model';
import {map} from 'rxjs/operators';
import {HaTopic, HaTopicDto} from '../ha-model/ha-entities/ha-topic.class';


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
  private getAll(page: number, size: number): Observable<ClPage<HaListStoryDto>> {
    return this.apiService.get(this.route, HaStory, {page: page, pageSize: size, resultIsPaginated: true});
  }

  public getAllPaginated(): HaStoryDatasourcePaginated {
    return new FlEntityPaginatedDatasource(
      (page, size) => this.getAll(page, size), 10);
  }


  public getAllPaginatedFiltered(filters: HaStoryFilter): HaStoryDatasourcePaginated {
    return new FlEntityPaginatedDatasource(
      (page, size) => this.getAllByFilter(filters, page, size), 10);
  }

  private getAllByFilter(filters: HaStoryFilter, page: number, size: number): Observable<ClPage<HaListStoryDto>> {
    return this.apiService.post(this.route + '/filter', filters, HaStory, {page: page, pageSize: size, resultIsPaginated: true});
  }

  /**
   * Call http get to get all stories paginated
   * @param page page number
   * @param size page size
   * @param topicId topic id
   * return a list of stories paginated
   */
  private getAllByTopicId(page: number, size: number, topicId: string): Observable<ClPage<HaStory>> {
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

  /**
   * Call http put to update the title of a story
   * @param id id of the story
   * @param title new title
   * return a story
   */
  public updateTitle(id: string, title: string): Observable<HaStory> {
    return this.apiService.put(this.route + '/' + id + '/title', {title: title}, HaStory);
  }

  /**
   * Call http put to update the content of the story
   * @param id id of the story
   * @param content new content
   * return a story
   */
  public updateContent(id: string, content: CmRichTextI): Observable<HaStory> {
    return this.apiService.put(this.route + '/' + id + '/content', {content: content}, HaStory);
  }

  public getFilePath(filename: string): string {
    return this.apiService.getBaseRouteUrl(`${this.route}/image/${filename}`);
  }

  uploadImage(file: File): Observable<FlTextEditorUploadedImage> {
    const formData = new FormData();
    formData.append('file', file);
    return this.apiService.put(`${this.route}/image`, formData).pipe(
      map(
        (uploadedFile: any) => {
          return {
            filename: uploadedFile.filename,
            width: uploadedFile.width,
            height: uploadedFile.height,
          };
        }
      )
    );
  }

  getImageUrl(filename: string): string {
    return this.getFilePath(filename);
  }

  publishStory(id: string): Observable<HaStory> {
    return this.apiService.put(`${this.route}/${id}/publish`, {});
  }

  getMyStories(): HaMyStoriesDataSource {
    return new FlEntityPaginatedDatasource((page, size) =>
      this.getMyStoriesPaginated(page, size), 10);
  }

  private getMyStoriesPaginated(page: number, size: number): Observable<ClPage<HaStoryDataSourceDataDto>> {
    return this.apiService.get(this.route + '/my', HaStory, {page: page, pageSize: size, resultIsPaginated: true});
  }


  /***
   * Check if the current user is the story owner
   * @param storyId story id
   */
  isStoryOwner(storyId: string): Observable<boolean> {
    return this.apiService.get(`${this.route}/${storyId}/is-owner`, Boolean);
  }

  /***
   * Add topic to story
   * @param topicDto topic to add
   * @param storyId story id
   */
  addTopicToStory(topicDto: HaTopicDto, storyId: string): Observable<HaTopic> {
    return this.apiService.put(`${this.route}/${storyId}/add-topic`, topicDto, HaTopic);
  }

  removeTopicFromStory(topicId: string, storyId: string): Observable<any> {
    return this.apiService.put(`${this.route}/${storyId}/remove-topic/${topicId}`, {});
  }
}
