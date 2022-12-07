import {Injectable} from '@angular/core';
import {FlBioNetworkService, FlUpdateMetabolite} from '@monorepo/front-core-lib';
import {Observable, of} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class LabBioNetworkService extends FlBioNetworkService{
  enableSave(): boolean {
    return true;
  }


  saveNodePosition(metaboliteInfo: FlUpdateMetabolite): Observable<boolean> {
    console.log('save metabolite position', metaboliteInfo);
    return of(true);
  }



}
