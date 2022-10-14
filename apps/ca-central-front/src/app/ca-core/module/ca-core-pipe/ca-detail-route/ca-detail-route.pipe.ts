import {Pipe, PipeTransform} from '@angular/core';
import {CaEntity} from '../../../model/entities/ca-entity.entity';
import {CaProject} from '../../../model/entities/ca-project.class';
import {CaSmartDb} from '../../../model/entities/ca-smart-db.entity';
import {CaLabInstance} from '../../../model/entities/ca-lab-instance.class';
import {CaRouterService} from '../../../service/ca-router.service';
import {CaOrganization} from '../../../model/entities/ca-organization.class';
import {CaGroup, CaGroupType} from '../../../model/entities/ca-group.entity';
import {CaExperiment} from '../../../model/entities/ca-experiment.class';
import {CaReport} from '../../../model/entities/ca-report.class';

type CaObjectType = 'project' | 'experiment' | 'report' | 'smartDb' | 'labInstance' | 'organization' | 'group';


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

  transform(value: string, objectType?: CaObjectType): string;
  transform(value: CaEntity): string;
  transform(value: string | CaEntity, objectType?: CaObjectType): string {

    let id: string;
    if (objectType == null) {
      [objectType, id] = this.getObjectType(value);
    } else {
      id = value as string;
    }

    if (objectType == null) return null;

    switch (objectType) {
      case 'project':
        return CaRouterService.getProjectDetailRoute(id);
      case 'experiment':
        return CaRouterService.getExperimentDetailRoute(id);
      case 'report':
        return CaRouterService.getReportDetailRoute(id);
      case 'smartDb':
        return CaRouterService.getSmartDbDetailRoute(id);
      case 'labInstance':
        return CaRouterService.getLabInstanceDetailRoute(id);
      case 'organization':
        return CaRouterService.getOrganizationRoute(id);
      case 'group':
        return CaRouterService.getTeamRoute(id);
      default:
        console.error(`[caDetailRoute] object type ${objectType} not supported`);
        return null;
    }

  }

  private getObjectType(obj: any): [CaObjectType, string] {
    if (obj instanceof CaProject) {
      return ['project', obj.id];
    } else if (obj instanceof CaExperiment) {
      return ['experiment', obj.id];
    } else if (obj instanceof CaReport) {
      return ['report', obj.id];
    } else if (obj instanceof CaSmartDb) {
      return ['smartDb', obj.id];
    } else if (obj instanceof CaLabInstance) {
      return ['labInstance', obj.id];
    } else if (obj instanceof CaOrganization) {
      return ['organization', obj.id];
    } else if (obj instanceof CaGroup) {
      switch (obj.type) {
        // specific case for organization group, we return the page of the organization not the group
        case CaGroupType.ORGANIZATION:
          return ['organization', obj.organizationId];
        case CaGroupType.TEAM:
          return ['group', obj.id];
        case CaGroupType.SINGLE_USER:
          return [null, obj.id];
      }
    } else {
      console.error('[caDetailRoute] The object is not supported');
      return [null, null];
    }
  }


}
