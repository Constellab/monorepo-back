import {Injectable} from '@angular/core';
import {
  FlAdvancedSearchInput,
  FlApiWithCacheService,
  FlSearchConverter,
  FlSearchService
} from '@monorepo/front-core-lib';
import {LabTypeEntity, LabTypeObjectType} from '../model/entities/lab-type/lab-type.entity';
import {Observable} from 'rxjs';
import {ClCoreJsonConvert, ClPageI} from '@monorepo/core-lib';
import {LabTypeSearch, LabTypeSearchFields} from '../entity-module/lab-type-core/model/lab-type-advanced-search.class';
import {LabTaskType} from '../model/entities/lab-type/lab-task-type.entity';
import {LabProtocolType} from '../model/entities/lab-type/lab-protocol-type.entity';

@Injectable({
  providedIn: 'root'
})
export class LabTypeService implements FlSearchService<LabTypeEntity> {

  private readonly route: string = 'typing';

  constructor(private apiService: FlApiWithCacheService) {
  }

  public getTyping(typingName: string): Observable<LabTaskType | LabProtocolType> {
    return this.apiService.getWithCache(`${this.route}/${typingName}`, (obj) => {
      // construct the correct class based on object_type
      const objectType: LabTypeObjectType = obj.object_type;
      switch (objectType) {
        case 'TASK':
          return ClCoreJsonConvert.deserialize(obj, LabTaskType);
        case 'PROTOCOL':
          return ClCoreJsonConvert.deserialize(obj, LabProtocolType);
        default:
          return ClCoreJsonConvert.deserialize(obj, LabTypeEntity);
      }
    });
  }

  public advancedSearch(page: number, pageSize: number, filters: LabTypeSearchFields): Observable<ClPageI<LabTypeEntity>> {

    const data: FlAdvancedSearchInput = {
      filtersCriteria: FlSearchConverter.convertObjectToSearchCriteriaList(filters, LabTypeSearch.advancedSearchConverter),
      sortsCriteria: null
    };

    // force filtering on TASK or PROTOCOL
    data.filtersCriteria.push({key: 'object_type', operator: 'IN', value: ['TASK', 'PROTOCOL']})

    return this.apiService.post(`${this.route}/advanced-search`, data, LabTypeEntity, {
      page: page, pageSize: pageSize, resultIsPaginated: true
    });
  }


}
