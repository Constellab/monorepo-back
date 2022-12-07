import {FlCoord} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';

export abstract class FlBioNetworkService{

  abstract enableSave(): boolean;

  abstract saveNodePosition(nodeId: string, position: FlCoord): Observable<boolean>;
}
