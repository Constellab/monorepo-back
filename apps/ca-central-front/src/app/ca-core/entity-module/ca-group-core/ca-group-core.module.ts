import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaGroupSelectOptionsComponent} from './component/ca-group-select-options/ca-group-select-options.component';
import {CaCoreModule} from '../../ca-core.module';
import {CaGroupInlineComponent} from './component/ca-group-inline/ca-group-inline.component';
import {CaGroupTypeIconPipe} from './pipe/ca-group-type-icon.pipe';
import {CaGroupShareDialogComponent} from './component/ca-group-share-dialog/ca-group-share-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';


@NgModule({
  declarations: [
    CaGroupSelectOptionsComponent,
    CaGroupInlineComponent,
    CaGroupTypeIconPipe,
    CaGroupShareDialogComponent
  ],
  exports: [
    CaGroupSelectOptionsComponent,
    CaGroupInlineComponent,
    CaGroupTypeIconPipe,
    CaGroupShareDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    CaCoreModule,
  ],
})
export class CaGroupCoreModule {
}
