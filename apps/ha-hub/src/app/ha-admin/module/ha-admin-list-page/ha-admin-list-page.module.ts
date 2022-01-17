import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {HaCoreModule} from '../../../ha-core/ha-core.module';
import {HaAdminCoreModule} from '../ha-admin-core/ha-admin-core.module';
import {HaAdminListPageComponent} from './ha-admin-list-page/ha-admin-list-page.component';
import {HaAdminListPageFormDialogComponent} from './ha-admin-list-page-form-dialog/ha-admin-list-page-form-dialog.component';
import {ReactiveFormsModule} from '@angular/forms';

@NgModule({
  declarations: [HaAdminListPageComponent, HaAdminListPageFormDialogComponent],
  imports: [
    HaAdminCoreModule,
    CommonModule,
    HaCoreModule,
    ReactiveFormsModule
  ]
})
export class HaAdminListPageModule {

}
