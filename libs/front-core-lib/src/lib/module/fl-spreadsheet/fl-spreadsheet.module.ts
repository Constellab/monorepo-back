import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlSpreadsheetDirective} from './directive/fl-spreadsheet.directive';
import {FlSpreadsheetComponent} from './component/fl-spreadsheet/fl-spreadsheet.component';
import {FlSpreadsheetCellComponent} from './component/fl-spreadsheet-cell/fl-spreadsheet-cell.component';
import { FlSpreadsheetHeaderCellComponent } from './component/fl-spreadsheet-header-cell/fl-spreadsheet-header-cell.component';
import {FormsModule} from '@angular/forms';


@NgModule({
  declarations: [
    FlSpreadsheetDirective,
    FlSpreadsheetComponent,
    FlSpreadsheetCellComponent,
    FlSpreadsheetHeaderCellComponent,
  ],
  exports: [
    FlSpreadsheetDirective,
    FlSpreadsheetComponent
  ],
  imports: [
    CommonModule,

    FormsModule,
  ],
})
export class FlSpreadsheetModule {
}
