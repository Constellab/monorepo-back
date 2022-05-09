import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {LabBrickEntity, LabBrickMigration} from '../model/entities/lab-brick.entity';
import {FlApiService} from '@monorepo/front-core-lib';

@Injectable({providedIn: 'root'})
export class LabBrickService {

  private readonly route: string = 'brick';

  constructor(private apiService: FlApiService) {
  }


  public getAllBricks(): Observable<LabBrickEntity[]> {
    return this.apiService.get(this.route, LabBrickEntity);
  }

  public generateTechnicalDoc(brickName: string): Observable<any> {
    return this.apiService.get(`${this.route}/${brickName}/technical-doc`);
  }

  public getBrickMigrations(brickName: string): Observable<LabBrickMigration[]> {
    return this.apiService.get(`${this.route}/${brickName}/migrations`, LabBrickMigration);
  }

  public callMigration(brickName: string, version: string): Observable<void> {
    return this.apiService.post(`${this.route}/${brickName}/call-migration/${version}`, null);
  }
}
