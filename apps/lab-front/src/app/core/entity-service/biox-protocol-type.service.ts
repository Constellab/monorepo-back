import {Injectable} from '@angular/core';
import {FlApiWithCacheService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {createTypedTree} from '../model/global/typed-tree.class';
import {BioxProtocolType} from '../model/entities/lab-type/biox-protocol-type.entity';
import {BioxLabTypeEntity, BioxLabTypeEntityTree} from '../model/entities/lab-type/biox-lab-type.entity';

@Injectable({
  providedIn: 'root'
})
export class BioxProtocolTypeService {

  private readonly route: string = 'protocol-type';

  constructor(private apiService: FlApiWithCacheService) {
  }


  public getProtocolTypesTree(): Observable<BioxLabTypeEntityTree[]> {
    return this.apiService.get(`${this.route}/tree`, createTypedTree(BioxLabTypeEntity));
  }

  public getProtocolType(id: string): Observable<BioxProtocolType> {
    return this.apiService.getByIdWithCache(`${this.route}`, id, BioxProtocolType);
  }
}
