import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CoreModule} from '../core/core.module';
import {ProtocolCoreModule} from '../core/entity-module/protocol-core/protocol-core.module';
import {ProtocolDetailPageComponent} from './component/protocol-detail-page/protocol-detail-page.component';
import {ProtocolRoutingModule} from './protocol-routing.module';
import {ProtocolExperimentsListComponent} from './component/protocol-experiments-list/protocol-experiments-list.component';
import {ExperimentCoreModule} from '../dashboard/module/experiment-core/experiment-core.module';
import {MyProtocolsPageComponent} from './component/my-protocols-page/my-protocols-page.component';


/**
 * Module for the protocol detail page
 */
@NgModule({
  declarations: [ProtocolDetailPageComponent, ProtocolExperimentsListComponent, MyProtocolsPageComponent],
  imports: [
    CommonModule,

    CoreModule,
    ProtocolCoreModule,
    ExperimentCoreModule,

    ProtocolRoutingModule,
  ]
})
export class ProtocolModule {
}
