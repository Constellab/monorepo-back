import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { QuillModule } from 'ngx-quill';
import { DaCoreModule } from '../../../da-core/da-core.module';
import { DaAdminCoreModule } from '../da-admin-core/da-admin-core.module';
import { DaAdminListPageComponent } from './da-admin-list-page/da-admin-list-page.component';

@NgModule({
    declarations: [DaAdminListPageComponent],
    imports: [
        DaAdminCoreModule,
        CommonModule,
        DaCoreModule,
        BrowserAnimationsModule,

        QuillModule.forRoot()
    ]
})
export class DaAdminListPageModule{
    
}