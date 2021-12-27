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
import {
  FlSpreadsheetContextMenuComponent
} from './component/fl-spreadsheet-context-menu/fl-spreadsheet-context-menu.component';
import {FlCorePipeModule} from '../fl-core-pipe/fl-core-pipe.module';
import {MatIconModule} from '@angular/material/icon';
import {FlIconModule} from '../fl-svg-icon/fl-icon.module';
import {
  FlSpreadsheetChartSelectionComponent
} from './component/fl-spreadsheet-chart-selection/fl-spreadsheet-chart-selection.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import {MatInputModule} from '@angular/material/input';
import {
  FlSpreadsheetSelectionInputComponent
} from './component/fl-spreadsheet-selection-input/fl-spreadsheet-selection-input.component';
import {FlSpreadsheetSelectionInputGroupDirective} from './directive/fl-spreadsheet-selection-input-group.directive';
import {MatSelectModule} from '@angular/material/select';
import {FlChartModule} from '../fl-chart/fl-chart.module';
import {FlTranslateService} from '../fl-translate/service/fl-translate.service';
import {flSpreadSheetI18n} from './i18n/fl-spreadsheet.i18n';
import {
  FlSpreadsheetChartSerieSelectionComponent
} from './component/fl-spreadsheet-chart-serie-selection/fl-spreadsheet-chart-serie-selection.component';
import {MatDividerModule} from '@angular/material/divider';
import {FlMenuDynamicModule} from '../fl-menu-dynamic/fl-menu-dynamic.module';
import {
  FlSpreadsheetSheetSelectionComponent
} from './component/fl-spreadsheet-sheet-selection/fl-spreadsheet-sheet-selection.component';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {FlTextIconModule} from '../fl-text-icon/fl-text-icon.module';


@NgModule({
  declarations: [
    FlSpreadsheetComponent,
    FlSpreadsheetCellComponent,
    FlSpreadsheetHeaderCellComponent,
    FlCellHeaderPipe,
    FlSpreadsheetContextMenuComponent,
    FlSpreadsheetChartSelectionComponent,
    FlSpreadsheetSelectionInputComponent,
    FlSpreadsheetSelectionInputGroupDirective,
    FlSpreadsheetChartSerieSelectionComponent,
    FlSpreadsheetSheetSelectionComponent,
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
  ],
})
export class FlSpreadsheetModule {
  constructor(translateService: FlTranslateService) {
    translateService.addModuleTranslation('FlSpreadsheetModule', flSpreadSheetI18n);
  }
}
