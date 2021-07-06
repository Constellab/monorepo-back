import {Injectable} from '@angular/core';
import {FlPortalService} from '../../fl-portal/service/fl-portal.service';
import {FlChartPortalConfig} from '../model/fl-chart.class';
import {FlPortalConfig} from '../../fl-portal/model/fl-portal-config.class';
import {FlOverlayRef} from '../../fl-portal/model/fl-overlay-ref.class';
import {FlChartPortalComponent} from '../component/fl-chart-portal/fl-chart-portal.component';

/**
 * Service to open chart portal
 */
@Injectable()
export class FlChartPortalService extends FlPortalService {


  public createDynamicChartPortal(chartConfig: FlChartPortalConfig, portalConfig: FlPortalConfig): FlOverlayRef {
    return this.createPortal(FlChartPortalComponent, portalConfig, chartConfig);
  }

}
