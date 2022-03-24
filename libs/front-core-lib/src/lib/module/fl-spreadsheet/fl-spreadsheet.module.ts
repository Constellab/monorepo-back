import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlSpreadsheetComponent} from './component/fl-spreadsheet/fl-spreadsheet.component';
import {FlSpreadsheetCellComponent} from './component/fl-spreadsheet-cell/fl-spreadsheet-cell.component';
import {
  FlSpreadsheetHeaderCellComponent
} from './component/fl-spreadsheet-header-cell/fl-spreadsheet-header-cell.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlCoreDirectiveModule} from '../fl-core-directive/fl-core-directive.module';
import {FlCellHeaderPipe} from './pipe/fl-cell-header.pipe';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {MatMenuModule} from '@angular/material/menu';
import {FlPortalModule} from '../fl-portal/fl-portal.module';
import {FlCorePipeModule} from '../fl-core-pipe/fl-core-pipe.module';
import {MatIconModule} from '@angular/material/icon';
import {FlIconModule} from '../fl-svg-icon/fl-icon.module';
import {FlSheetChartSelectionComponent} from './component/fl-sheet-chart-selection/fl-sheet-chart-selection.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import {MatInputModule} from '@angular/material/input';
import {
  FlSpreadsheetSelectionListenerComponent
} from './component/fl-spreadsheet-selection-listener/fl-spreadsheet-selection-listener.component';
import {MatSelectModule} from '@angular/material/select';
import {FlChartModule} from '../fl-chart/fl-chart.module';
import {FlTranslateService} from '../fl-translate/service/fl-translate.service';
import {flSpreadSheetI18n} from './i18n/fl-spreadsheet.i18n';
import {
  FlSheetChartSerieSelectionComponent
} from './component/fl-sheet-chart-serie-selection/fl-sheet-chart-serie-selection.component';
import {MatDividerModule} from '@angular/material/divider';
import {FlMenuDynamicModule} from '../fl-menu-dynamic/fl-menu-dynamic.module';
import {
  FlSpreadsheetSheetSelectionComponent
} from './component/fl-spreadsheet-sheet-selection/fl-spreadsheet-sheet-selection.component';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {FlTextIconModule} from '../fl-text-icon/fl-text-icon.module';
import {MatSidenavModule} from '@angular/material/sidenav';
import {FlDrawerModule} from '../fl-drawer/fl-drawer.module';
import {FlSpreadsheetDrawerComponent} from './component/fl-spreadsheet-drawer/fl-spreadsheet-drawer.component';
import {FlSectionModule} from '../fl-section/fl-section.module';
import {FlTagModule} from '../fl-tag/fl-tag.module';
import {FlCoreComponentModule} from '../fl-core-component/fl-core-component.module';
import {
  FlSpreadsheetHeaderInfoComponent
} from './component/fl-spreadsheet-header-info/fl-spreadsheet-header-info.component';
import {FlKeyValueModule} from '../fl-key-value/fl-key-value.module';
import {FlSheetRangesInputComponent} from './component/fl-sheet-ranges-input/fl-sheet-ranges-input.component';
import {MatRadioModule} from '@angular/material/radio';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatChipsModule} from '@angular/material/chips';
import {FlAutocompleteMultipleModule} from '../fl-autocomplete-multiple/fl-autocomplete-multiple.module';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {FlResizeModule} from '../fl-resize/fl-resize.module';
import {FlSpreadsheetCellInfoComponent} from './component/fl-spreadsheet-cell-info/fl-spreadsheet-cell-info.component';
import {
  FlSpreadsheetHeaderTagsComponent
} from './component/fl-spreadsheet-header-tags/fl-spreadsheet-header-tags.component';


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
