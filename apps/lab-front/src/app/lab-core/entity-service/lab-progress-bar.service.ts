import {Injectable} from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';

@Injectable({
  providedIn: 'root'
})
export class LabProgressBarService {

  private readonly route: string = 'progress-bar';


  constructor(private apiService: FlApiService) {
  }

  public getDownloadProgressBarUrl(id: string): string {
    return this.apiService.getBaseRouteUrl(`${this.route}/${id}/download`);
  }

}
