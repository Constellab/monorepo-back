import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PortalModule} from '@angular/cdk/portal';
import {FlPortalArrowComponent} from './component/fl-portal-arrow/fl-portal-arrow.component';
import {FlTooltipComponent} from './component/fl-tooltip/fl-tooltip.component';
import {FlPortalService} from './service/fl-portal.service';
import {FlTooltipService} from './service/fl-tooltip.service';

/**
 * Core modules containing components
 */
@NgModule({
  declarations: [
    FlPortalArrowComponent,
    FlTooltipComponent,
  ],
  exports: [],
  imports: [
    CommonModule,

    // Material
    PortalModule,
  ]
})
export class FlPortalModule {

  public static forRoot(): ModuleWithProviders<FlPortalModule> {
    return {
      ngModule: FlPortalModule,
      providers: [FlPortalService, FlTooltipService]
    };
  }
}
