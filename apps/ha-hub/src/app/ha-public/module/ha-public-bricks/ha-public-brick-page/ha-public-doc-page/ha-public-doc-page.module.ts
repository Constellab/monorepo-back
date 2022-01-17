import {NgModule} from '@angular/core';
import {HaPublicDocPageComponent} from './ha-public-doc-page/ha-public-doc-page.component';
import {HaCoreModule} from '../../../../../ha-core/ha-core.module';
import {CoreModule} from '@angular/flex-layout';
import {ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from '@angular/common';

@NgModule({
    declarations: [HaPublicDocPageComponent],
    exports: [
        HaPublicDocPageComponent
    ],
  imports: [HaCoreModule, HaCoreModule, CoreModule, ReactiveFormsModule, CommonModule]
})
export class HaPublicDocPageModule {
}
