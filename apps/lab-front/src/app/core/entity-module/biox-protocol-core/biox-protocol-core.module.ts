import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BioxProtocolCardComponent} from './component/biox-protocol-card/biox-protocol-card.component';
import {CoreModule} from '../../core.module';
import {BioxProtocolTypeListComponent} from './component/biox-protocol-type-list/biox-protocol-type-list.component';


@NgModule({
  declarations: [
    BioxProtocolCardComponent,
    BioxProtocolTypeListComponent
  ],
  exports: [
    BioxProtocolCardComponent,
    BioxProtocolTypeListComponent
  ],
  imports: [
    CommonModule,

    CoreModule,
  ]
})
export class BioxProtocolCoreModule {
}
