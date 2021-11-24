import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DaCoreModule } from '../../../da-core/da-core.module';
import { DaAdminCoreModule } from '../da-admin-core/da-admin-core.module';
import { DaAdminLoginComponent } from './da-admin-login/da-admin-login.component';

@NgModule({
  declarations: [DaAdminLoginComponent],
  imports: [
    DaAdminCoreModule,
    CommonModule,
    DaCoreModule,
  ]
})
export class DaAdminLoginModule {

}
