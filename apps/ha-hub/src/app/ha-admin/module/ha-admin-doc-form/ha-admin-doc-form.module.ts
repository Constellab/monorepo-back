import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HaCoreModule} from '../../../ha-core/ha-core.module';
import {HaAdminCoreModule} from '../ha-admin-core/ha-admin-core.module';
import {HaAdminDocFormComponent} from './ha-admin-doc-form/ha-admin-doc-form.component';
import {HaAdminDocFormPageComponent} from './ha-admin-doc-form-page/ha-admin-doc-form-page.component';


@NgModule({
  declarations: [HaAdminDocFormComponent, HaAdminDocFormPageComponent],
  imports: [
    HaAdminCoreModule,
    ReactiveFormsModule,
    CommonModule,
    HaCoreModule,
    FormsModule
  ]
})
export class HaAdminDocFormModule {
}
