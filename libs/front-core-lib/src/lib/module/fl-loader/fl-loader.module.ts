import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlLoaderComponent} from './fl-loader/fl-loader.component';
import {FlButtonLoaderComponent} from './fl-button-loader/fl-button-loader.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';


@NgModule({
  declarations: [
    FlLoaderComponent,
    FlButtonLoaderComponent
  ],
  exports: [
    FlLoaderComponent,
    FlButtonLoaderComponent
  ],
  imports: [
    CommonModule,

    MatProgressSpinnerModule,
  ]
})
export class FlLoaderModule {
}
