import {Injectable} from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';
import {Observable, of} from 'rxjs';
import {BioxResource} from '../model/entities/biox-resource.entity';


@Injectable({
  providedIn: 'root'
})
export class BioxResourceService {

  private readonly route: string = 'resource';

  constructor(private apiService: FlApiService) {
  }

  public getByTypeAndId(type: string, id: string): Observable<BioxResource> {
    if(!type || !id){
      return of(null);
    }

    return this.apiService.get(`${this.route}/${type}/${id}`, BioxResource);
  }

}
