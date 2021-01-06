import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProtocolCardDetailComponent} from './component/protocol-card-detail/protocol-card-detail.component';
import {CoreModule} from '../../core.module';
import {ProtocolCardComponent} from './component/protocol-card/protocol-card.component';
import {ProtocolFormComponent} from './component/protocol-form/protocol-form.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ProtocolFormDialogComponent} from './component/protocol-form-dialog/protocol-form-dialog.component';
import {SelectProtocolOptionsComponent} from './component/select-protocol-options/select-protocol-options.component';
import {RouterModule} from '@angular/router';
import {ProtocolJsonComponent} from './component/protocol-json/protocol-json.component';
import {ProtocolsListComponent} from './component/protocols-list/protocols-list.component';

/**
 * Core module for the protocols
 */
@NgModule({
  declarations: [
    ProtocolCardDetailComponent,
    ProtocolCardComponent,
    ProtocolFormComponent,
    ProtocolFormDialogComponent,
    SelectProtocolOptionsComponent,
    ProtocolJsonComponent,
    ProtocolsListComponent,
  ],
  exports: [
    ProtocolCardDetailComponent,
    ProtocolCardComponent,
    ProtocolFormComponent,
    ProtocolFormDialogComponent,
    SelectProtocolOptionsComponent,
    ProtocolJsonComponent,
    ProtocolsListComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    CoreModule,
  ]
})
export class ProtocolCoreModule {
}
