import {Injectable} from '@angular/core';
import {FlApiWithCacheService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {BioxLabTypeEntity, BioxLabTypeEntityTree} from '../model/entities/lab-type/biox-lab-type.entity';
import {createTypedTree} from '../model/global/typed-tree.class';
import {BioxTaskType} from '../model/entities/lab-type/biox-task-type.entity';

@Injectable({
  providedIn: 'root'
})
export class BioxTaskService {

  private readonly typeRoute: string = 'task-type';


  constructor(private apiService: FlApiWithCacheService) {
  }

  ////////////////////////// TYPE ////////////////////////////
  public getTaskTypesTree(): Observable<BioxLabTypeEntityTree[]> {
    return this.apiService.get(`${this.typeRoute}/tree`, createTypedTree(BioxLabTypeEntity));
  }

  public getTaskType(id: string): Observable<BioxTaskType> {
    return this.apiService.getByIdWithCache(`${this.typeRoute}`, id, BioxTaskType);
  }
}



