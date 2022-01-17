import { NgModule } from '@angular/core';
import { HaAdminRoutingModule } from './ha-admin-routing.module';
import { HaAdminCoreModule } from './module/ha-admin-core/ha-admin-core.module';
import { HaAdminDocFormModule } from './module/ha-admin-doc-form/ha-admin-doc-form.module';
import { HaAdminListPageModule } from './module/ha-admin-list-page/ha-admin-list-page.module';
import {HaAdminLoginModule} from './module/ha-admin-login/ha-admin-login.module';

@NgModule({
  imports: [HaAdminCoreModule, HaAdminRoutingModule, HaAdminDocFormModule, HaAdminListPageModule, HaAdminLoginModule]
})
export class HaAdminModule {
}
