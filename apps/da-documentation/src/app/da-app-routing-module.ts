import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DaAdminModule } from './da-admin/da-admin.module';

const routes: Routes = [
    {
        path: 'admin',
        loadChildren: ()=> import('./da-admin/da-admin.module').then(m => m.DaAdminModule)
    },
    {
        path: '',
        pathMatch: 'full',
        redirectTo: ''
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        DaAdminModule
    ],
    exports: [
        RouterModule
    ]
})
export class DaAppRoutingModule{}