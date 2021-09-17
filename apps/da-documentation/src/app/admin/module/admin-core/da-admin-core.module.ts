import { NgModule } from "@angular/core";
import { DaAdminDocFormModule } from "../admin-doc-form/da-admin-doc-form.module";
import { DaAdminListPageModule } from "../admin-list-page/da-admin-list-page.module";

@NgModule({
    exports: [DaAdminDocFormModule, DaAdminListPageModule]
})
export class DaAdminCoreModule{}