import {NgModule} from '@angular/core';
import {
  FlAuthModule,
  FlCorePipeModule,
  FlDialogModule,
  FlFormModule,
  FlLoaderModule,
  FlSectionModule,
  FlSnackBarModule,
  FlTranslateModule
} from '@monorepo/front-core-lib';

@NgModule({
  exports: [
    FlCorePipeModule,
    FlFormModule,
    FlLoaderModule,
    FlDialogModule,
    FlSnackBarModule,
    FlTranslateModule,
    FlSectionModule,
    FlAuthModule
  ]
})
export class DaCustomLibraryModule {
}
