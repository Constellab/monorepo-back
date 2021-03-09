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
import {MatMenuModule} from '@angular/material/menu';
import {FlPortalModule} from '../fl-portal/fl-portal.module';
import { FlSpreadsheetContextMenuComponent } from './component/fl-spreadsheet-context-menu/fl-spreadsheet-context-menu.component';
import {FlCorePipeModule} from '../fl-core-pipe/fl-core-pipe.module';
import {MatIconModule} from '@angular/material/icon';
import {FlSvgIconModule} from '../fl-svg-icon/fl-svg-icon.module';


@NgModule({
  declarations: [
    FlSpreadsheetDirective,
    FlSpreadsheetComponent,
    FlSpreadsheetCellComponent,
    FlSpreadsheetHeaderCellComponent,
    CellHeaderPipe,
    FlSpreadsheetContextMenuComponent,
  ],
  exports: [
    FlSpreadsheetDirective,
    FlSpreadsheetComponent
  ],
  imports: [
    CommonModule,
    FormsModule,

    FlCoreDirectiveModule,
    FlPortalModule,
    FlSvgIconModule,

    ScrollingModule,
    MatMenuModule,
    FlCorePipeModule,
    MatIconModule
  ],
})
export class FlSpreadsheetModule {
}
