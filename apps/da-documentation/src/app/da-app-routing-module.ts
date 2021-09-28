import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DaAdminModule } from './da-admin/da-admin.module';
import { DaPublicModule } from './da-public/da-public.module';

const routes: Routes = [
    {
        path: 'admin',
        loadChildren: ()=> import('./da-admin/da-admin.module').then(m => m.DaAdminModule)
    },
    {
        path: 'docs',
        loadChildren: ()=> import('./da-public/da-public.module').then(m => m.DaPublicModule)
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
        DaAdminModule,
        DaPublicModule
    ],
    exports: [
        RouterModule
    ]
})
export class DaAppRoutingModule{}