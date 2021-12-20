import {Injectable} from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {BioxProject} from '../model/entities/biox-project.class';

@Injectable({
  providedIn: 'root'
})
export class BioxProjectService {

  private readonly route: string = 'project';


  constructor(private apiService: FlApiService) {
  }

  public getProjects(): Observable<BioxProject[]> {
    return this.apiService.get(this.route, BioxProject);
  }
}
