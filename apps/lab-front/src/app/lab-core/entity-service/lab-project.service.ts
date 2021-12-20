import {Injectable} from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {LabProject} from '../model/entities/lab-project.class';

@Injectable({
  providedIn: 'root'
})
export class LabProjectService {

  private readonly route: string = 'project';


  constructor(private apiService: FlApiService) {
  }

  public getProjects(): Observable<LabProject[]> {
    return this.apiService.get(this.route, LabProject);
  }
}
