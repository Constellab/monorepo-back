import {Injectable} from '@angular/core';
import {FlApiService, FlGetById} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {BioxResource, BioxResourceVM} from '../model/entities/biox-resource.entity';
import {createViewModel} from '../model/global/view-model.entity';


@Injectable({
  providedIn: 'root'
})
export class BioxResourceService implements FlGetById<BioxResourceVM> {


  constructor(private apiService: FlApiService) {
  }

  public getById(id: string): Observable<BioxResourceVM> {
    return this.apiService.get(`view/resource/${id}`, createViewModel(BioxResource));
  }

}
