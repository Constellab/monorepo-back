import {Pipe, PipeTransform} from '@angular/core';
import {CaEntity} from '../../../model/entities/ca-entity.entity';
import {CaProject} from '../../../model/entities/ca-project.class';
import {CaSmartDb} from '../../../model/entities/ca-smart-db.entity';
import {CaLabInstance} from '../../../model/entities/ca-lab-instance.class';
import {CaRouterService} from '../../../service/ca-router.service';

type CaObjectType = 'project' | 'smartDb' | 'labInstance'


/**
 * Pipe to get the detail route of an object
 *
 * 2 modes :
 *  Provide an object and the route is automatically detected form object type
 *  Provide an id and the object type
 */
@Pipe({
  name: 'caDetailRoute'
})
export class CaDetailRoutePipe implements PipeTransform {

  transform(value: string | CaEntity, objectType?: CaObjectType): string {
    if (objectType == null) {
      objectType = this.getObjectType(value);
    }

    if (objectType == null) return null;

    const id = typeof value === 'string' ? value : value.id;

    switch (objectType) {
      case 'project':
        return CaRouterService.getProjectDetailRoute(id);
      case 'smartDb':
        return CaRouterService.getSmartDbDetailRoute(id);
      case 'labInstance':
        return CaRouterService.getLabInstanceDetailRoute(id);
      default:
        console.error(`[caDetailRoute] object type ${objectType} not supported`);
        return null;
    }

  }

  private getObjectType(obj: any): CaObjectType {
    if (obj instanceof CaProject) {
      return 'project';
    } else if (obj instanceof CaSmartDb) {
      return 'smartDb';
    } else if (obj instanceof CaLabInstance) {
      return 'labInstance';
    } else {
      console.error('[caDetailRoute] The object is not supported');
      return null;
    }
  }


}
