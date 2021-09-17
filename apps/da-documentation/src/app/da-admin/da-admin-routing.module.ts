import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { DaAdminDocFormPageComponent } from './module/da-admin-doc-form/da-admin-doc-form-page/da-admin-doc-form-page.component';

const routes: Route[] = [
    {
        path: '', 
        component: DaAdminDocFormPageComponent
    },
    {
        path: ':id',
        component: DaAdminDocFormPageComponent
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