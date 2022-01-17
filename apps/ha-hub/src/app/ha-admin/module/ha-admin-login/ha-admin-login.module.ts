import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HaCoreModule } from '../../../ha-core/ha-core.module';
import { HaAdminCoreModule } from '../ha-admin-core/ha-admin-core.module';
import { HaAdminLoginComponent } from './ha-admin-login/ha-admin-login.component';

@NgModule({
  declarations: [HaAdminLoginComponent],
  imports: [
    HaAdminCoreModule,
    CommonModule,
    HaCoreModule,
  ]
})
export class HaAdminLoginModule {

}
