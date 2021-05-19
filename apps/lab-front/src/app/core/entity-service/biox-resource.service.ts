import {Injectable} from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {BioxResource, BioxResourceVM} from '../model/entities/biox-resource.entity';
import {createViewModel} from '../model/global/view-model.entity';


@Injectable({
  providedIn: 'root'
})
export class BioxResourceService {


  constructor(private apiService: FlApiService) {
  }

  public getByTypeAndId(type: string, id: string): Observable<BioxResourceVM> {
    return this.apiService.get(`view/${type}/${id}`, createViewModel(BioxResource));
  }

}
