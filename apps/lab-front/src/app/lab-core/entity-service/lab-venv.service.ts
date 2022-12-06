import {Injectable} from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';
import {LabVEnvCompleteInfo, LabVEnvsStatus} from '../model/entities/lab-venv.entity';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LabVenvService {

  private readonly route = 'venv';


  constructor(private apiService: FlApiService) {
  }

  public getVenvsStatus(): Observable<LabVEnvsStatus> {
    return this.apiService.get(this.route, LabVEnvsStatus);
  }

  public getVenvInfo(venvName: string): Observable<LabVEnvCompleteInfo> {
    return this.apiService.post(`${this.route}/get`,
      {venv_name: venvName},
      LabVEnvCompleteInfo);
  }

  public deleteVenv(venvName: string): Observable<any> {
    return this.apiService.post(`${this.route}/delete`,
      {venv_name: venvName});
  }

  public deleteAllVenvs(): Observable<any> {
    return this.apiService.delete(`${this.route}`);
  }
}
