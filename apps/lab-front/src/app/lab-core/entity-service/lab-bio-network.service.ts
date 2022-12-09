import {Injectable} from '@angular/core';
import {FlApiService, FlBioNetworkService, FlUpdateMetabolite} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class LabBioNetworkService extends FlBioNetworkService {

  private route: string = 'biota/compound';

  constructor(private apiService: FlApiService) {
    super();
  }

  enableSave(): boolean {
    return true;
  }


  saveMetaboliteLayout(metaboliteInfo: FlUpdateMetabolite): Observable<boolean> {
    return this.apiService.put(this.route + '/layout', metaboliteInfo).pipe(
      map(response => response != null)
    );
  }


}
