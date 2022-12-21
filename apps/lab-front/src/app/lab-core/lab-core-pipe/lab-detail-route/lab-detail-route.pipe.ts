import {Pipe, PipeTransform} from '@angular/core';
import {LabEntity} from '../../model/global/lab-entity.entity';
import {LabRouterService} from '../../service/lab-router.service';
import {LabReport} from '../../model/entities/lab-report.entity';
import {LabExperiment} from '../../model/entities/lab-experiment.entity';
import {LabResource} from '../../model/entities/resource/lab-resource.entity';
import {LabViewConfig} from '../../model/entities/resource/lab-view-config.entity';

export type LabObjectType = 'experiment' | 'resource' | 'report' | 'viewConfig';

/**
 * Pipe to get the detail route of an object
 *
 * 2 modes :
 *  Provide an object and the route is automatically detected form object type
 *  Provide an id and the object type
 */
@Pipe({
  name: 'labDetailRoute'
})
export class LabDetailRoutePipe implements PipeTransform {

  transform(value: string | LabEntity, objectType?: LabObjectType): string {
    if (objectType == null) {
      objectType = this.getObjectType(value);
    }

    if (objectType == null) return null;

    const id = typeof value === 'string' ? value : value.id;

    switch (objectType) {
      case 'experiment':
        return LabRouterService.getExperimentDetailRoute(id);
      case 'resource':
        return LabRouterService.getResourceDetailRoute(id);
      case 'report':
        return LabRouterService.getReportDetailRoute(id);
      case 'viewConfig':
        return LabRouterService.getViewConfigDetailRoute(id);
      default:
        console.error(`[labDetailRoute] object type ${objectType} not supported`);
        return null;
    }

  }

  private getObjectType(obj: any): LabObjectType {
    if (obj instanceof LabExperiment) {
      return 'experiment';
    } else if (obj instanceof LabResource) {
      return 'resource';
    } else if (obj instanceof LabReport) {
      return 'report';
    } else if (obj instanceof LabViewConfig) {
      return 'viewConfig';
    } else {
      console.error('[labDetailRoute] The object is not supported');
      return null;
    }
  }


}
