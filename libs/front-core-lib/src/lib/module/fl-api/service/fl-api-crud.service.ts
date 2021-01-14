import {Observable} from 'rxjs';
import {FlApiService} from './fl-api.service';

/**
 * Abstract CRUD service for basic api calls
 * T is the type of the object returns by the api route
 * K is an optional type if the object send for create or update are different than T
 */
export abstract class FlApiCrudService<T, K = T> {

  /**
   * @param route route for the api calls
   * @param classReference class reference of the objects
   * @param apiService apiService
   */
  protected constructor(protected route: string, protected classReference: new() => T,
                        protected apiService: FlApiService) {
  }

  /**
   * Call http create
   * @param object json object
   */
  public create(object: K): Observable<T> {
    return this.apiService.post(this.route, object, this.classReference);
  }


  /**
   * Call http update
   * @param object json object
   */
  public update(object: K): Observable<T> {
    return this.apiService.put(this.route, object, this.classReference);
  }

  /**
   * Call a http get one by id
   * @param id id of the entity
   */
  public getById(id: string): Observable<T> {
    return this.apiService.getById(this.route, id, this.classReference);
  }

  /**
   * Call a http delete
   * @param id id of the entity
   */
  public deleteById(id: string): Observable<void> {
    return this.apiService.deleteById(this.route, id);
  }
}


