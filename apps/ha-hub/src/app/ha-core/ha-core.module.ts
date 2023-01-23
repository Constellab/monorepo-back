import { NgModule } from '@angular/core';
import { HaCustomLibraryModule } from './ha-custom-library/ha-custom-library.module';
import { HaCustomMaterialModule } from './ha-custom-material/ha-custom-material.module';
import { HaIsAdminDirective } from './ha-module/ha-core-directive/ha-is-admin/ha-is-admin.directive';
import {
  HaIsAuthenticatedDirective
} from './ha-module/ha-core-directive/ha-is-authenticated/ha-is-authenticated.directive';

@NgModule({
  exports: [
    HaCustomLibraryModule,
    HaCustomMaterialModule,
    HaIsAdminDirective,
    HaIsAuthenticatedDirective
  ],
  declarations: [HaIsAdminDirective, HaIsAuthenticatedDirective]
})
export class HaCoreModule {}
