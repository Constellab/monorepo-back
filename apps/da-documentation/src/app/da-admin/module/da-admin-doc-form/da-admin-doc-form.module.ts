import { NgModule } from "@angular/core";
import { DaAdminCoreModule } from "../da-admin-core/da-admin-core.module";
import { DaAdminDocFormComponent } from "./component/da-admin-doc-form.component";

@NgModule({
    declarations: [DaAdminDocFormComponent],
    imports: [DaAdminCoreModule]
})
export class DaAdminDocFormModule{}