import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DaCoreModule } from '../../../da-core/da-core.module';
import { DaAdminCoreModule } from '../da-admin-core/da-admin-core.module';
import { DaAdminDocFormComponent } from './da-admin-doc-form/da-admin-doc-form.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { QuillModule } from 'ngx-quill';
import { DaAdminDocFormPageComponent } from './da-admin-doc-form-page/da-admin-doc-form-page.component';


@NgModule({
    declarations: [DaAdminDocFormComponent, DaAdminDocFormPageComponent],
    imports: [
        DaAdminCoreModule, 
        ReactiveFormsModule, 
        CommonModule,
        DaCoreModule,
        BrowserAnimationsModule,

        QuillModule.forRoot()
    ]
})
export class DaAdminDocFormModule{}