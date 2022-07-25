import {Injectable} from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {CaBrick, CaBrickVersion} from '../model/entities/ca-brick.class';


@Injectable({providedIn: 'root'})
export class CaBrickService {

  private readonly route = 'bricks';

  constructor(private apiService: FlApiService) {
  }

  public getBrickByBrickVersionId(id: string): Observable<CaBrick>{
    return this.apiService.get(`${this.route}/brick-version/${id}`, CaBrick);
  }

  public getAll(): Observable<CaBrick[]> {
    return this.apiService.get(this.route, CaBrick);
  }

  public getBrickVersions(brickName: string): Observable<CaBrickVersion[]> {
    return this.apiService.get(`${this.route}/${brickName}/versions`, CaBrickVersion);
  }

  public getBrickVersion(brickName: string, brickVersion: string): Observable<CaBrickVersion> {
    return this.apiService.get(`${this.route}/${brickName}/versions/${brickVersion}`, CaBrickVersion);
  }
}
