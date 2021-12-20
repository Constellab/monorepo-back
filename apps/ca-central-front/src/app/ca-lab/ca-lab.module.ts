import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaMyLabsPageComponent} from './component/ca-my-labs-page/ca-my-labs-page.component';
import {CaCoreModule} from '../ca-core/ca-core.module';
import {CaLabCoreModule} from '../ca-core/entity-module/ca-lab-core/ca-lab-core.module';
import {CaLabRoutingModule} from './ca-lab-routing.module';


@NgModule({
  declarations: [CaMyLabsPageComponent],
  imports: [
    CommonModule,

    CaCoreModule,
    CaLabCoreModule,

    CaLabRoutingModule,
  ]
})
export class CaLabModule {
}
