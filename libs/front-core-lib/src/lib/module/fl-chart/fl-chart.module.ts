import {NgModule} from '@angular/core';
import {FlChartCoreModule} from './module/module/fl-chart-core/fl-chart-core.module';
import {FlChartDynamicComponent} from './component/fl-chart-dynamic/fl-chart-dynamic.component';
import {FlChartDynamicPortalComponent} from './component/fl-chart-dynamic-portal/fl-chart-dynamic-portal.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {FlChartPortalService} from './service/fl-chart-portal.service';
import {FlPortalModule} from '../fl-portal/fl-portal.module';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FlChartComponentSelectOptionsComponent} from './component/fl-chart-component-select-options/fl-chart-component-select-options.component';
import {MatOptionModule} from '@angular/material/core';
import {CommonModule} from '@angular/common';
import {FlSvgIconModule} from '../fl-svg-icon/fl-svg-icon.module';
import {FlChartPathwayModule} from './module/module/fl-chart-pathway/fl-chart-pathway.module';
import {FlTranslateService} from '../fl-translate/service/fl-translate.service';
import {flChartI18n} from './i18n/fl-chart.i18n';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import {MatTooltipModule} from '@angular/material/tooltip';

/**
 * Main module exporting all the chart modules
 */
@NgModule({
  exports: [
    // Component
    FlChartDynamicComponent,
    FlChartDynamicComponent,
    FlChartDynamicPortalComponent,
    FlChartComponentSelectOptionsComponent,

    FlChartCoreModule,
    FlChartPathwayModule,
  ],
  declarations: [
    FlChartDynamicComponent,
    FlChartDynamicPortalComponent,
    FlChartComponentSelectOptionsComponent
  ],
  imports: [
    CommonModule,

    FlChartCoreModule,
    FlPortalModule,
    FlSvgIconModule,
    FlTranslateModule,

    DragDropModule,
    MatButtonModule,
    MatIconModule,
    FlexLayoutModule,
    MatOptionModule,
    MatTooltipModule,
  ],
  providers: [
    FlChartPortalService
  ]
})
export class FlChartModule {
  constructor(translateService: FlTranslateService) {
    translateService.addModuleTranslation('FlChartModule', flChartI18n);
  }
}
