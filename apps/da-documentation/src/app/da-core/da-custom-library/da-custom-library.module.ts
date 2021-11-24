import {NgModule} from '@angular/core';
import {
  FlAuthModule,
  FlCoreDirectiveModule,
  FlCorePipeModule,
  FlDialogModule,
  FlFormModule,
  FlLoaderModule, FlPortalModule,
  FlSectionModule,
  FlSnackBarModule, FlTextEditorModule,
  FlTranslateModule
} from '@monorepo/front-core-lib';

@NgModule({
  exports: [
    FlCoreDirectiveModule,
    FlCorePipeModule,
    FlFormModule,
    FlPortalModule,
    FlLoaderModule,
    FlDialogModule,
    FlSnackBarModule,
    FlTranslateModule,
    FlSectionModule,
    FlAuthModule,
    FlTextEditorModule
  ]
})
export class DaCustomLibraryModule {
}
