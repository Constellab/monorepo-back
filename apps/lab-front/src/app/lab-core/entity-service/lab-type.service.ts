import {Injectable} from '@angular/core';
import {
  FlAdvancedSearchInput,
  FlApiWithCacheService,
  FlSearchConverter,
  FLSearchFunction
} from '@monorepo/front-core-lib';
import {LabTypeEntity, LabTypeObjectType} from '../model/entities/lab-type/lab-type.entity';
import {Observable} from 'rxjs';
import {ClCoreJsonConvert, ClPageI} from '@monorepo/core-lib';
import {LabTypeSearch, LabTypeSearchFields} from '../entity-module/lab-type-core/model/lab-type-advanced-search.class';
import {LabProcessType} from '../model/entities/lab-type/lab-process-type.entity';

@Injectable({
  providedIn: 'root'
})
export class LabTypeService {

  private readonly route: string = 'typing';

  constructor(private apiService: FlApiWithCacheService) {
  }

  public static deserializeTyping(typingObj: any): LabTypeEntity | LabTypeEntity[] {
    // construct the correct class based on object_type
    const objectType: LabTypeObjectType = typingObj.object_type;
    switch (objectType) {
      case 'TASK':
        return ClCoreJsonConvert.deserialize(typingObj, LabProcessType);
      case 'PROTOCOL':
        return ClCoreJsonConvert.deserialize(typingObj, LabProcessType);
      default:
        return ClCoreJsonConvert.deserialize(typingObj, LabTypeEntity);
    }
  }

  public getTyping(typingName: string): Observable<LabProcessType> {
    return this.apiService.getWithCache(`${this.route}/${typingName}`, LabTypeService.deserializeTyping).getObs();
  }

  public getAdvancedSearchFunction(): FLSearchFunction<LabTypeEntity> {
    return (page: number, pageSize: number, filters?: LabTypeSearchFields) => this.advancedSearch(page, pageSize, filters);
  }

  public advancedSearch(page: number, pageSize: number, filters: LabTypeSearchFields): Observable<ClPageI<LabTypeEntity>> {

    const data: FlAdvancedSearchInput = {
      filtersCriteria: FlSearchConverter.convertObjectToSearchCriteriaList(filters, LabTypeSearch.advancedSearchConverter),
      sortsCriteria: null
    };

    return this.apiService.post(`${this.route}/advanced-search`, data, LabTypeEntity, {
      page: page, pageSize: pageSize, resultIsPaginated: true
    });
  }

  public getTransformerByResourceType(resourceTypingName: string): Observable<LabTypeEntity[]> {
    return this.apiService.getWithCache(`${this.route}/transformers/${resourceTypingName}`,
      LabProcessType).getObs();
  }


}
