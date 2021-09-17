import { NgModule } from "@angular/core";
import { Route, RouterModule } from "@angular/router";
import { DaAdminDocFormComponent } from "./module/da-admin-doc-form/component/da-admin-doc-form.component";

const routes: Route[] = [
    {
        path: '', 
        component: DaAdminDocFormComponent
    },
    {
        path: ':id',
        component: DaAdminDocFormComponent
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class DaAdminRoutingModule{}