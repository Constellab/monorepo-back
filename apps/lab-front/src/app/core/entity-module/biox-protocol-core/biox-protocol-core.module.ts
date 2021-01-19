import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BioxProtocolCardComponent} from './component/biox-protocol-card/biox-protocol-card.component';
import {CoreModule} from '../../core.module';


@NgModule({
  declarations: [
    BioxProtocolCardComponent
  ],
  exports: [
    BioxProtocolCardComponent
  ],
  imports: [
    CommonModule,

    CoreModule,
  ]
})
export class BioxProtocolCoreModule {
}
