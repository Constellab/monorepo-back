import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlChartCoreModule} from '../fl-chart-core/fl-chart-core.module';
import {FlChartPathwayComponent} from './component/fl-chart-pathway/fl-chart-pathway.component';
import {FlChartPathwayNodeDetailComponent} from './component/fl-chart-pathway-node-detail/fl-chart-pathway-node-detail.component';
import {FlTranslateModule} from '../../../../fl-translate/fl-translate.module';
import {FlJsonEditorModule} from '../../../../fl-json-editor/fl-json-editor.module';
import {MatSidenavModule} from '@angular/material/sidenav';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FlCoreDirectiveModule} from '../../../../fl-core-directive/fl-core-directive.module';
import {FlChartPathwayNodeLinksComponent} from './component/fl-chart-pathway-node-links/fl-chart-pathway-node-links.component';
import {MatListModule} from '@angular/material/list';
import {FlCoreComponentModule} from '../../../../fl-core-component/fl-core-component.module';

/**
 * Module to handle specific chart to show a pathway
 */
@NgModule({
  declarations: [
    FlChartPathwayComponent,
    FlChartPathwayNodeDetailComponent,
    FlChartPathwayNodeLinksComponent
  ],
  exports: [
    FlChartPathwayComponent,
  ],
  imports: [
    CommonModule,

    MatSidenavModule,
    FlexLayoutModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatListModule,

    FlChartCoreModule,
    FlTranslateModule,
    FlJsonEditorModule,
    FlCoreDirectiveModule,
    FlCoreComponentModule,
  ],
})
export class FlChartPathwayModule {
}
