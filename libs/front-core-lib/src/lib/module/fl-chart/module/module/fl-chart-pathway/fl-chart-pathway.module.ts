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
import {MatSliderModule} from '@angular/material/slider';
import {FormsModule} from '@angular/forms';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {FlPathwayDrawerActionComponent} from './component/fl-pathway-drawer-action/fl-pathway-drawer-action.component';
import {FlPathwayConfigComponent} from './component/fl-pathway-config/fl-pathway-config.component';
import {MatCheckboxModule} from '@angular/material/checkbox';

/**
 * Module to handle specific chart to show a pathway
 */
@NgModule({
  declarations: [
    FlChartPathwayComponent,
    FlChartPathwayNodeDetailComponent,
    FlChartPathwayNodeLinksComponent,
    FlPathwayDrawerActionComponent,
    FlPathwayConfigComponent
  ],
  exports: [
    FlChartPathwayComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,

    MatSidenavModule,
    FlexLayoutModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatListModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatCheckboxModule,


    FlChartCoreModule,
    FlTranslateModule,
    FlJsonEditorModule,
    FlCoreDirectiveModule,
    FlCoreComponentModule,
  ],
})
export class FlChartPathwayModule {
}
