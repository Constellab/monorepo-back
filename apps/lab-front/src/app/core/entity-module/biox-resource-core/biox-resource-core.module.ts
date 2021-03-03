import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BioxResourceInfoComponent } from './component/biox-resource-info/biox-resource-info.component';
import {CoreModule} from '../../core.module';
import { BioxResourcePortalComponent } from './component/biox-resource-portal/biox-resource-portal.component';
import { BioxResourceSpreadsheetComponent } from './component/biox-resource-spreadsheet/biox-resource-spreadsheet.component';


@NgModule({
  declarations: [
    BioxResourceInfoComponent,
    BioxResourcePortalComponent,
    BioxResourceSpreadsheetComponent
  ],
  exports: [
    BioxResourceInfoComponent,
    BioxResourcePortalComponent,
    BioxResourceSpreadsheetComponent
  ],
  imports: [
    CommonModule,

    CoreModule,
  ],
})
export class BioxResourceCoreModule { }
