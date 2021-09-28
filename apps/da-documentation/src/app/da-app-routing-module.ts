import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

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
        RouterModule.forRoot(
            routes, 
            // load all lazy module on start
            {
                preloadingStrategy: PreloadAllModules, 
                scrollPositionRestoration: 'enabled', 
                relativeLinkResolution: 'legacy'
            }
        ),
    ],
    exports: [
        RouterModule
    ]
})
export class DaAppRoutingModule{}