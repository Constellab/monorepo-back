import {NgModule} from '@angular/core';
import {
  FlSpreadsheetSheetSelectionComponent
} from './component/fl-spreadsheet-sheet-selection/fl-spreadsheet-sheet-selection.component';
import {CommonModule} from '@angular/common';
import {FlChartModule} from '../fl-chart/fl-chart.module';
import {FlLoaderModule} from '../fl-loader/fl-loader.module';
import {MatInputModule} from '@angular/material/input';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlCorePipeModule} from '../fl-core-pipe/fl-core-pipe.module';
import {FlPortalModule} from '../fl-portal/fl-portal.module';
import {FlSpreadsheetComponent} from './component/fl-spreadsheet/fl-spreadsheet.component';
import {MatMenuModule} from '@angular/material/menu';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FlSpreadsheetCellComponent} from './component/fl-spreadsheet-cell/fl-spreadsheet-cell.component';
import {
  FlSheetChartSerieSelectionComponent
} from './component/fl-sheet-chart-serie-selection/fl-sheet-chart-serie-selection.component';
import {FlTextIconModule} from '../fl-text-icon/fl-text-icon.module';
import {MatSelectModule} from '@angular/material/select';
import {FlMenuDynamicModule} from '../fl-menu-dynamic/fl-menu-dynamic.module';
import {MatIconModule} from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';
import {
  FlSpreadsheetHeaderCellComponent
} from './component/fl-spreadsheet-header-cell/fl-spreadsheet-header-cell.component';
import {MatChipsModule} from '@angular/material/chips';
import {FlCellHeaderPipe} from './pipe/fl-cell-header.pipe';
import {
  FlSpreadsheetHeaderTagsComponent
} from './component/fl-spreadsheet-header-tags/fl-spreadsheet-header-tags.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {FlResizeModule} from '../fl-resize/fl-resize.module';
import {FlSheetChartSelectionComponent} from './component/fl-sheet-chart-selection/fl-sheet-chart-selection.component';
import {FlPortalActionsModule} from '../fl-portal-actions/fl-portal-actions.module';
import {FlSectionModule} from '../fl-section/fl-section.module';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {FlSpreadsheetDrawerComponent} from './component/fl-spreadsheet-drawer/fl-spreadsheet-drawer.component';
import {
  FlSpreadsheetHeaderInfoComponent
} from './component/fl-spreadsheet-header-info/fl-spreadsheet-header-info.component';
import {flSpreadSheetI18n} from './i18n/fl-spreadsheet.i18n';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {FlCoreDirectiveModule} from '../fl-core-directive/fl-core-directive.module';
import {FlCoreComponentModule} from '../fl-core-component/fl-core-component.module';
import {MatButtonModule} from '@angular/material/button';
import {
  FlSpreadsheetSelectionListenerComponent
} from './component/fl-spreadsheet-selection-listener/fl-spreadsheet-selection-listener.component';
import {FlSpreadsheetCellInfoComponent} from './component/fl-spreadsheet-cell-info/fl-spreadsheet-cell-info.component';
import {FlSheetRangesInputComponent} from './component/fl-sheet-ranges-input/fl-sheet-ranges-input.component';
import {FlDrawerModule} from '../fl-drawer/fl-drawer.module';
import {FlKeyValueModule} from '../fl-key-value/fl-key-value.module';
import {FlTranslateService} from '../fl-translate/service/fl-translate.service';
import {FlAutocompleteMultipleModule} from '../fl-autocomplete-multiple/fl-autocomplete-multiple.module';
import {MatRadioModule} from '@angular/material/radio';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import {MatDividerModule} from '@angular/material/divider';
import {FlIconModule} from '../fl-svg-icon/fl-icon.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FlTagModule} from '../fl-tag/fl-tag.module';


@NgModule({
  declarations: [
    FlSpreadsheetComponent,
    FlSpreadsheetCellComponent,
    FlSpreadsheetHeaderCellComponent,
    FlCellHeaderPipe,
    FlSheetChartSelectionComponent,
    FlSpreadsheetSelectionListenerComponent,
    FlSheetChartSerieSelectionComponent,
    FlSpreadsheetSheetSelectionComponent,
    FlSpreadsheetDrawerComponent,
    FlSpreadsheetHeaderInfoComponent,
    FlSheetRangesInputComponent,
    FlSpreadsheetCellInfoComponent,
    FlSpreadsheetHeaderTagsComponent,
  ],
  exports: [
    FlSpreadsheetComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    FlCoreDirectiveModule,
    FlPortalModule,
    FlIconModule,
    FlCorePipeModule,
    FlTranslateModule,
    FlChartModule,
    FlMenuDynamicModule,
    FlTextIconModule,
    FlDrawerModule,
    FlSectionModule,
    FlTagModule,
    FlCoreComponentModule,
    FlKeyValueModule,
    FlAutocompleteMultipleModule,
    FlResizeModule,
    FlLoaderModule,
    FlPortalActionsModule,

    ScrollingModule,
    MatMenuModule,
    MatIconModule,
    DragDropModule,
    FlexLayoutModule,
    MatTooltipModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    MatMenuModule,
    MatButtonToggleModule,
    MatSidenavModule,
    MatRadioModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatCheckboxModule,
  ],
})
export class FlSpreadsheetModule {
  constructor(translateService: FlTranslateService) {
    translateService.addModuleTranslation('FlSpreadsheetModule', flSpreadSheetI18n);
  }
}
