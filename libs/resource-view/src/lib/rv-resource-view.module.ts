import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RvResourceViewComponent} from './component/rv-resource-view/rv-resource-view.component';
import {RvViewJsonComponent} from './component/rv-view-json/rv-view-json.component';
import {
  FlBioNetworkModule,
  FlChartModule,
  FlCoreComponentModule,
  FlJsonEditorModule,
  FlSpreadsheetModule,
  FlTranslateModule,
  FlTranslateService
} from '@monorepo/front-core-lib';
import {rvResourceViewI18n} from './rv-resource-view.i18n';
import {RvViewChart2dComponent} from './component/rv-view-chart-2d/rv-view-chart2d.component';
import {RvViewMultiViewsComponent} from './component/rv-view-multi-views/rv-view-multi-views.component';
import {MatGridListModule} from '@angular/material/grid-list';
import {RvViewNetworkComponent} from './component/rv-view-network/rv-view-network.component';
import {RV_MODULE_CONFIG, RvResourceViewModuleConfig} from './model/rv-resource-view-module.config';
import {RvViewTextComponent} from './component/rv-view-text/rv-view-text.component';
import {RvViewSpreadsheetComponent} from './component/rv-view-spreadsheet/rv-view-spreadsheet.component';

@NgModule({
  imports: [
    CommonModule,

    MatGridListModule,

    FlJsonEditorModule,
    FlCoreComponentModule,
    FlTranslateModule,
    FlChartModule,
    FlBioNetworkModule,
    FlSpreadsheetModule,
  ],
  declarations: [
    RvResourceViewComponent,
    RvViewJsonComponent,
    RvViewChart2dComponent,
    RvViewMultiViewsComponent,
    RvViewNetworkComponent,
    RvViewTextComponent,
    RvViewSpreadsheetComponent,
  ],
  exports: [
    RvResourceViewComponent,
    RvViewJsonComponent,
    RvViewChart2dComponent,
    RvViewMultiViewsComponent,
    RvViewNetworkComponent,
    RvViewTextComponent,
    RvViewSpreadsheetComponent,
  ],
})
export class RvResourceViewModule {

  constructor(translateService: FlTranslateService) {
    translateService.addModuleTranslation('RvResourceViewModule', rvResourceViewI18n);
  }

  /**
   * Method to configure the svg icon registrations
   * @param config
   */
  public static forRoot(config: RvResourceViewModuleConfig): ModuleWithProviders<RvResourceViewModule> {
    return {
      ngModule: RvResourceViewModule,
      providers: [
        {provide: RV_MODULE_CONFIG, useValue: config},
      ],
    };
  }
}
