import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CustomMaterialModule} from '../../custom-material/custom-material.module';
import {LoaderComponent} from './loader/loader.component';
import {ButtonLoaderComponent} from './button-loader/button-loader.component';


@NgModule({
  declarations: [
    LoaderComponent,
    ButtonLoaderComponent
  ],
  exports: [
    LoaderComponent,
    ButtonLoaderComponent
  ],
  imports: [
    CommonModule,

    CustomMaterialModule,
  ]
})
export class LoaderModule {
}
