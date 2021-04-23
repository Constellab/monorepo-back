import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BioxProcessTypeCardComponent} from './component/biox-process-type-card/biox-process-type-card.component';
import {CoreModule} from '../../core.module';


@NgModule({
  declarations: [
    BioxProcessTypeCardComponent
  ],
  exports: [BioxProcessTypeCardComponent],
  imports: [
    CommonModule,

    CoreModule,
  ]
})
export class BioxProcessTypeModule {
}
