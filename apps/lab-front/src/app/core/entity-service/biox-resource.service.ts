import {Injectable} from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {BioxResource} from '../model/entities/biox-resource.entity';


@Injectable({
  providedIn: 'root'
})
export class BioxExperimentService {


  constructor(private apiService: FlApiService) {
  }

  public getResource(id: string): Observable<BioxResource> {
    return this.apiService.get(`resource/${id}`, BioxResource);
  }

}
