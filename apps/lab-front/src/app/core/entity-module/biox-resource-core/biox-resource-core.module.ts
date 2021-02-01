import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BioxResourceInfoComponent } from './component/biox-resource-info/biox-resource-info.component';
import {CoreModule} from '../../core.module';
import { BioxResourceDialogComponent } from './component/biox-resource-dialog/biox-resource-dialog.component';


@NgModule({
  declarations: [
    BioxResourceInfoComponent,
    BioxResourceDialogComponent
  ],
  exports: [BioxResourceInfoComponent, BioxResourceDialogComponent],
  imports: [
    CommonModule,

    CoreModule,
  ],
})
export class BioxResourceCoreModule { }
