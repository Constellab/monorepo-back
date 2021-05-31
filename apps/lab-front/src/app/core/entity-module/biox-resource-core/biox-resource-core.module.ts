import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BioxResourceInfoComponent } from './component/biox-resource-info/biox-resource-info.component';
import {CoreModule} from '../../core.module';
import { BioxResourcePortalComponent } from './component/biox-resource-portal/biox-resource-portal.component';
import { BioxResourceSpreadsheetComponent } from './component/biox-resource-spreadsheet/biox-resource-spreadsheet.component';
import {RouterModule} from '@angular/router';
import { BioxResourceJsonComponent } from './component/biox-resource-json/biox-resource-json.component';
import {BioxResourceTextComponent} from './component/biox-resource-text/biox-resource-text.component';
import { BioxResourceImageComponent } from './component/biox-resource-image/biox-resource-image.component';


@NgModule({
  declarations: [
    BioxResourceInfoComponent,
    BioxResourcePortalComponent,
    BioxResourceSpreadsheetComponent,
    BioxResourceJsonComponent,
    BioxResourceTextComponent,
    BioxResourceImageComponent,
  ],
  exports: [
    BioxResourceInfoComponent,
    BioxResourcePortalComponent,
    BioxResourceSpreadsheetComponent,
    BioxResourceJsonComponent,
    BioxResourceTextComponent,
    BioxResourceImageComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,

    CoreModule,
  ],
})
export class BioxResourceCoreModule { }
