import { NgModule } from '@angular/core';
import { CoreModule } from '@angular/flex-layout';
import { DaAdminRoutingModule } from './da-admin-routing.module';
import { DaAdminCoreModule } from './module/da-admin-core/da-admin-core.module';
import { DaAdminDocFormModule } from './module/da-admin-doc-form/da-admin-doc-form.module';
import { DaAdminListPageModule } from './module/da-admin-list-page/da-admin-list-page.module';

@NgModule({
    imports: [DaAdminCoreModule, DaAdminRoutingModule, CoreModule, DaAdminDocFormModule, DaAdminListPageModule]
})
export class DaAdminModule{
}