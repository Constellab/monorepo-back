import { NgModule } from "@angular/core";
import { DaAdminRoutingModule } from "./da-admin-routing.module";
import { DaAdminCoreModule } from "./module/da-admin-core/da-admin-core.module";

@NgModule({
    imports: [DaAdminCoreModule, DaAdminRoutingModule]
})
export class DaAdminModule{
}