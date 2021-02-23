import {Injectable} from '@angular/core';
import {FlApiService, FlGetById} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {BioxResource} from '../model/entities/biox-resource.entity';


@Injectable({
  providedIn: 'root'
})
export class BioxResourceService implements FlGetById<BioxResource>{


  constructor(private apiService: FlApiService) {
  }

  public getById(id: string): Observable<BioxResource> {
    return this.apiService.get(`view/resource/${id}`, BioxResource);
  }

}
