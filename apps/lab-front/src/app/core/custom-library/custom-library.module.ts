import {NgModule} from '@angular/core';
import {
  FlCardModule,
  FlCoreDirectiveModule,
  FlCorePipeModule,
  FlDialogModule, FlSectionModule,
  FlSnackBarModule, FlStatusModule,
  FlSvgIconModule, FlTextIconModule,
  FlTranslateModule
} from '@monorepo/front-core-lib';

/**
 * Regrouped all the needed import for this app from library
 *
 * All the module should be in export
 */
@NgModule({
  exports: [
    FlCoreDirectiveModule,
    FlCorePipeModule,

    FlTranslateModule,
    FlDialogModule,
    FlSnackBarModule,
    FlSvgIconModule,
    FlSectionModule,
    FlCardModule,
    FlTextIconModule,
    FlStatusModule,

  ]
})
export class CustomLibraryModule {
}
