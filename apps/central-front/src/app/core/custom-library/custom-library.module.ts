import {NgModule} from '@angular/core';
import {
  FlApiModule, FlAuthModule,
  FlCardModule,
  FlCoreComponentModule,
  FlCoreDirectiveModule,
  FlCorePipeModule, FlDateModule,
  FlDialogModule,
  FlFormModule,
  FlImageModule,
  FlInfiniteScrollModule,
  FlJsonEditorModule,
  FlLoaderModule,
  FlSectionModule,
  FlSnackBarModule,
  FlStatusModule,
  FlSvgIconModule,
  FlTextIconModule,
  FlTranslateModule
} from '@monorepo/front-core-lib';

/**
 * Regrouped all the needed import from library
 *
 * All the module should be in export
 */
@NgModule({
  exports: [
    // import front lib core modules
    FlCoreComponentModule,
    FlCorePipeModule,
    FlCoreDirectiveModule,

    // other module
    FlApiModule,
    FlLoaderModule,
    FlTranslateModule,
    FlFormModule,
    FlCardModule,
    FlImageModule,
    FlSvgIconModule,
    FlSectionModule,
    FlTextIconModule,
    FlDialogModule,
    FlSnackBarModule,
    FlJsonEditorModule,
    FlStatusModule,
    FlInfiniteScrollModule,
    FlDateModule,
    FlAuthModule,
  ]
})
export class CustomLibraryModule {
}
