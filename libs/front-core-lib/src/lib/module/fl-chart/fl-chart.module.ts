import {NgModule} from '@angular/core';
import {FlChartComponent} from './component/fl-chart/fl-chart.component';
import {FlChartPortalComponent} from './component/fl-chart-portal/fl-chart-portal.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {FlChartPortalService} from './service/fl-chart-portal.service';
import {FlPortalModule} from '../fl-portal/fl-portal.module';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FlChartTypeSelectOptionsComponent} from './component/fl-chart-type-select-options/fl-chart-type-select-options.component';
import {MatOptionModule} from '@angular/material/core';
import {CommonModule} from '@angular/common';
import {FlSvgIconModule} from '../fl-svg-icon/fl-svg-icon.module';
import {FlTranslateService} from '../fl-translate/service/fl-translate.service';
import {flChartI18n} from './i18n/fl-chart.i18n';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FlChartLegendComponent} from './component/fl-chart-legend/fl-chart-legend.component';
import {FlChartDataWithSeriePortalComponent} from './component/fl-chart-data-with-serie-portal/fl-chart-data-with-serie-portal.component';
import {FlChartBoxPlotDataPortalComponent} from './component/fl-chart-box-plot-data-portal/fl-chart-box-plot-data-portal.component';
import {FlChartSerieInlineComponent} from './component/fl-chart-serie-inline/fl-chart-serie-inline.component';
import {FlChartScalePipe} from './pipe/fl-chart-scale.pipe';
import {FlChartBinDataPortalComponent} from './component/fl-chart-bin-data-portal/fl-chart-bin-data-portal.component';
import {FlChartContainerComponent} from './component/fl-chart-container/fl-chart-container.component';
import {FlMenuDynamicModule} from '../fl-menu-dynamic/fl-menu-dynamic.module';
import {MatDividerModule} from '@angular/material/divider';

/**
 * Main module exporting all the chart modules
 */
@NgModule({
  declarations: [
    // Component
    FlChartComponent,
    FlChartComponent,
    FlChartPortalComponent,
    FlChartTypeSelectOptionsComponent,
    FlChartLegendComponent,
    FlChartDataWithSeriePortalComponent,
    FlChartBoxPlotDataPortalComponent,
    FlChartSerieInlineComponent,
    FlChartBinDataPortalComponent,

    // Pipe
    FlChartScalePipe,

    FlChartContainerComponent,
  ],
  exports: [
    // Component
    FlChartComponent,
    FlChartComponent,
    FlChartPortalComponent,
    FlChartTypeSelectOptionsComponent,
    FlChartLegendComponent,

    // Pipe
    FlChartScalePipe,

    FlChartContainerComponent,
  ],
  imports: [
    CommonModule,

    FlPortalModule,
    FlSvgIconModule,
    FlTranslateModule,
    FlMenuDynamicModule,

    DragDropModule,
    MatButtonModule,
    MatIconModule,
    FlexLayoutModule,
    MatOptionModule,
    MatTooltipModule,
    MatDividerModule,
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
