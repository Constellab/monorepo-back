import {FlBioNetworkMetaboliteLevel} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';

export interface FlUpdateMetabolite{
  chebi_id: string;
  cluster_id: string;
  x: number;
  y: number;
  level: FlBioNetworkMetaboliteLevel;
}

export abstract class FlBioNetworkService{

  abstract enableSave(): boolean;


  abstract saveMetaboliteLayout(metaboliteInfo: FlUpdateMetabolite): Observable<boolean>;
}
