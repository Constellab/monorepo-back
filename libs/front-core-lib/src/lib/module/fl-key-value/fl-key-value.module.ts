import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlKeyValueComponent} from './fl-key-value/fl-key-value.component';
import {FlKeyComponent} from './fl-key/fl-key.component';


@NgModule({
  declarations: [
    FlKeyValueComponent,
    FlKeyComponent
  ],
  exports: [
    FlKeyValueComponent,
    FlKeyComponent
  ],
  imports: [
    CommonModule
  ],
})
export class FlKeyValueModule { }
