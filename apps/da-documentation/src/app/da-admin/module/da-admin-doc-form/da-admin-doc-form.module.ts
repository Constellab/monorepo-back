import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DaCoreModule} from '../../../da-core/da-core.module';
import {DaAdminCoreModule} from '../da-admin-core/da-admin-core.module';
import {DaAdminDocFormComponent} from './da-admin-doc-form/da-admin-doc-form.component';
import {DaAdminDocFormPageComponent} from './da-admin-doc-form-page/da-admin-doc-form-page.component';


@NgModule({
  declarations: [DaAdminDocFormComponent, DaAdminDocFormPageComponent],
  imports: [
    DaAdminCoreModule,
    ReactiveFormsModule,
    CommonModule,
    DaCoreModule,
    FormsModule
  ]
})
export class DaAdminDocFormModule {
}
