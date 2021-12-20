import {Injectable} from '@angular/core';
import {FlApiWithCacheService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {LabTypeEntity, LabTypeEntityTree} from '../model/entities/lab-type/lab-type.entity';
import {labCreateTypedTree} from '../model/global/lab-typed-tree.class';
import {LabTaskType} from '../model/entities/lab-type/lab-task-type.entity';

@Injectable({
  providedIn: 'root'
})
export class LabTaskService {

  private readonly typeRoute: string = 'task-type';


  constructor(private apiService: FlApiWithCacheService) {
  }

  ////////////////////////// TYPE ////////////////////////////
  public getTaskTypesTree(): Observable<LabTypeEntityTree[]> {
    return this.apiService.get(`${this.typeRoute}/tree`, labCreateTypedTree(LabTypeEntity));
  }

  public getTaskType(id: string): Observable<LabTaskType> {
    return this.apiService.getByIdWithCache(`${this.typeRoute}`, id, LabTaskType);
  }

  public getTransformerByResourceType(resourceTypingName: string): Observable<LabTypeEntity[]> {
    return this.apiService.getWithCache(`${this.typeRoute}/transformers/${resourceTypingName}`,
      LabTaskType);
  }
}



