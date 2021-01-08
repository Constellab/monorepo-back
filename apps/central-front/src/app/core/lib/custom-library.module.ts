import {NgModule} from '@angular/core';
import {
  FlCardModule,
  FlCoreComponentModule,
  FlCoreDirectiveModule,
  FlCorePipeModule,
  FlDialogModule,
  FlFormModule,
  FlImageModule,
  FlLoaderModule,
  FlSectionModule,
  FlSnackBarModule,
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

  ]
})
export class CustomLibraryModule {
}
