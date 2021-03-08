import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlSpreadsheetDirective} from './directive/fl-spreadsheet.directive';
import {FlSpreadsheetComponent} from './component/fl-spreadsheet/fl-spreadsheet.component';
import {FlSpreadsheetCellComponent} from './component/fl-spreadsheet-cell/fl-spreadsheet-cell.component';
import {FlSpreadsheetHeaderCellComponent} from './component/fl-spreadsheet-header-cell/fl-spreadsheet-header-cell.component';
import {FormsModule} from '@angular/forms';
import {FlCoreDirectiveModule} from '../fl-core-directive/fl-core-directive.module';
import {CellHeaderPipe} from './pipe/cell-header.pipe';
import {ScrollingModule} from '@angular/cdk/scrolling';


@NgModule({
  declarations: [
    FlSpreadsheetDirective,
    FlSpreadsheetComponent,
    FlSpreadsheetCellComponent,
    FlSpreadsheetHeaderCellComponent,
    CellHeaderPipe,
  ],
  exports: [
    FlSpreadsheetDirective,
    FlSpreadsheetComponent
  ],
  imports: [
    CommonModule,
    FlCoreDirectiveModule,

    FormsModule,
    ScrollingModule,
  ],
})
export class FlSpreadsheetModule {
}
