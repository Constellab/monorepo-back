import { NgModule } from '@angular/core';
import { CoreModule } from '@angular/flex-layout';
import { DaAdminRoutingModule } from './da-admin-routing.module';
import { DaAdminCoreModule } from './module/da-admin-core/da-admin-core.module';
import { DaAdminDocFormModule } from './module/da-admin-doc-form/da-admin-doc-form.module';

@NgModule({
    imports: [DaAdminCoreModule, DaAdminRoutingModule, CoreModule, DaAdminDocFormModule]
})
export class DaAdminModule{
}