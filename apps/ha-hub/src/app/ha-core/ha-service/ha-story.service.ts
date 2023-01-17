import {Injectable} from '@angular/core';
import {
  FlApiService,
  FlEntityPaginatedDatasource,
  FlTextEditorImageLoader,
  FlTextEditorUploadedImage
} from '@monorepo/front-core-lib';
import {
  HaCreateStoryDto,
  HaListStoryDto,
  HaStory,
  HaStoryDatasourcePaginated
} from '../ha-model/ha-entities/ha-story.class';
import {Observable} from 'rxjs';
import {ClPage} from '@monorepo/core-lib';
import {CmRichTextI} from '@monorepo/common-model';
import {map} from 'rxjs/operators';


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
}
