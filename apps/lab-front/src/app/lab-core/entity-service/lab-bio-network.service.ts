import {Injectable} from '@angular/core';
import {FlBioNetworkService, FlCoord} from '@monorepo/front-core-lib';
import {Observable, of} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class LabBioNetworkService extends FlBioNetworkService{
  enableSave(): boolean {
    return true;
  }


  saveNodePosition(metaboliteId: string, position: FlCoord): Observable<boolean> {
    console.log('save metabolite position', metaboliteId, position);
    return of(true);
  }



}
