import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MyLabsPageComponent} from './component/my-labs-page/my-labs-page.component';
import {CoreModule} from '../core/core.module';
import {LabCoreModule} from '../core/entity-module/lab-core/lab-core.module';
import {LabRoutingModule} from './lab-routing.module';


@NgModule({
  declarations: [MyLabsPageComponent],
  imports: [
    CommonModule,

    CoreModule,
    LabCoreModule,

    LabRoutingModule,
  ]
})
export class LabModule {
}
