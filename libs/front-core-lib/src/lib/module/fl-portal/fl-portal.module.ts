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
import {MatIconModule} from '@angular/material/icon';
import {FlPortalComponent} from './component/fl-portal/fl-portal.component';
import {FlPortalContentComponent} from './component/fl-portal-content/fl-portal-content.component';
import {FlPortalFooterComponent} from './component/fl-portal-footer/fl-portal-footer.component';
import {FlPortalHeaderButtonsComponent} from './component/fl-portal-header-buttons/fl-portal-header-buttons.component';
import {FlPortalZIndexDirective} from './directive/fl-portal-z-index.directive';
import {MatButtonModule} from '@angular/material/button';

/**
 * Core modules containing components
 */
@NgModule({
  declarations: [
    FlPortalArrowComponent,
    FlTooltipComponent,
    FlPortalCloseDirective,
    FlPortalHeaderComponent,
    FlPortalComponent,
    FlPortalContentComponent,
    FlPortalFooterComponent,
    FlPortalHeaderButtonsComponent,
    FlPortalZIndexDirective,
  ],
  exports: [
    FlPortalCloseDirective,
    FlPortalHeaderComponent,
    FlPortalComponent,
    FlPortalContentComponent,
    FlPortalFooterComponent,
    FlPortalHeaderButtonsComponent,
    FlPortalZIndexDirective,
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
