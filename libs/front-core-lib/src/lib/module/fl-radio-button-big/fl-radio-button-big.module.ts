import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlRadioButtonBigComponent} from './component/fl-radio-button-big/fl-radio-button-big.component';
import {MatLegacyRadioModule as MatRadioModule} from '@angular/material/legacy-radio';
import {FlexLayoutModule} from '@angular/flex-layout';


@NgModule({
  declarations: [
    FlRadioButtonBigComponent,
  ],
  exports: [
    FlRadioButtonBigComponent,
  ],
  imports: [
    CommonModule,

    MatRadioModule,
    FlexLayoutModule,
  ]
})
export class FlRadioButtonBigModule {
}
