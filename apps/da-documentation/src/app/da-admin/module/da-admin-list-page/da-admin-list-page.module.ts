import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { QuillModule } from 'ngx-quill';
import { DaCoreModule } from '../../../da-core/da-core.module';
import { DaAdminCoreModule } from '../da-admin-core/da-admin-core.module';
import { DaAdminListPageComponent } from './da-admin-list-page/da-admin-list-page.component';
import { DaAdminListPageFormDialogComponent } from './da-admin-list-page-form-dialog/da-admin-list-page-form-dialog.component';
import {ReactiveFormsModule} from '@angular/forms';

@NgModule({
  declarations: [DaAdminListPageComponent, DaAdminListPageFormDialogComponent],
  imports: [
    DaAdminCoreModule,
    CommonModule,
    DaCoreModule,

    QuillModule.forRoot(),
    ReactiveFormsModule
  ]
})
export class DaAdminListPageModule{

}
