import { NgModule } from '@angular/core';
import { HaCustomLibraryModule } from './ha-custom-library/ha-custom-library.module';
import { HaCustomMaterialModule } from './ha-custom-material/ha-custom-material.module';

@NgModule({
  exports: [
    HaCustomLibraryModule,
    HaCustomMaterialModule,
  ]
})
export class HaCoreModule {}
