import {Injectable} from '@angular/core';
import {FlApiWithCacheService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {BioxProcessType} from '../model/entities/lab-type/biox-process-type.entity';
import {createTypedTree} from '../model/global/typed-tree.class';
import {BioxLabTypeEntity, BioxLabTypeEntityTree} from '../model/entities/lab-type/biox-lab-type.entity';

@Injectable({
  providedIn: 'root'
})
export class BioxProcessTypeService {

  private readonly route: string = 'task-type';

  constructor(private apiService: FlApiWithCacheService) {
  }

  public getProcessTypesTree(): Observable<BioxLabTypeEntityTree[]> {
    return this.apiService.get(`${this.route}/tree`, createTypedTree(BioxLabTypeEntity));
  }

  public getProcessType(id: string): Observable<BioxProcessType> {
    return this.apiService.getByIdWithCache(`${this.route}`, id, BioxProcessType);
  }
}
