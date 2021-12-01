import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PortalModule} from '@angular/cdk/portal';
import {FlPortalArrowComponent} from './component/fl-portal-arrow/fl-portal-arrow.component';
import {FlTooltipComponent} from './component/fl-tooltip/fl-tooltip.component';
import {FlPortalService} from './service/fl-portal.service';
import {FlTooltipService} from './service/fl-tooltip.service';
import {FlPortalCloseDirective} from './directive/fl-portal-close.directive';
import {FlPortalHeaderComponent} from './component/fl-portal-header/fl-portal-header.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

/**
 * Core modules containing components
 */
@NgModule({
  declarations: [
    FlPortalArrowComponent,
    FlTooltipComponent,
    FlPortalCloseDirective,
    FlPortalHeaderComponent,
  ],
  exports: [
    FlPortalCloseDirective,
    FlPortalHeaderComponent
  ],
  imports: [
    CommonModule,

    // Material
    PortalModule,
    DragDropModule,
    FlexLayoutModule,
    MatButtonModule,
    MatIconModule,
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
