import { NgModule } from '@angular/core';
import { DaCustomLibraryModule } from './da-custom-library/da-custom-library.module';
import { DaCustomMaterialModule } from './da-custom-material/da-custom-material.module';

@NgModule({
  exports: [
    DaCustomLibraryModule,
    DaCustomMaterialModule,
  ]
})
export class DaCoreModule{}
