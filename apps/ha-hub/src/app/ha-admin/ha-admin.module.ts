import {NgModule} from '@angular/core';
import {HaAdminRoutingModule} from './ha-admin-routing.module';
import {HaAdminCoreModule} from './module/ha-admin-core/ha-admin-core.module';
import {HaAdminPageComponent} from './module/ha-admin-page/ha-admin-page.component';
import {MatButtonModule} from '@angular/material/button';
import {HaCoreModule} from '../ha-core/ha-core.module';
import {CommonModule} from '@angular/common';

@NgModule({
  imports: [HaAdminCoreModule, HaAdminRoutingModule, MatButtonModule, HaCoreModule, CommonModule],
  declarations: [
    HaAdminPageComponent
  ]
})
export class HaAdminModule {
}
