import {NgModule} from '@angular/core';
import {FlCoreDirectiveModule, FlDialogModule, FlSnackBarModule, FlSvgIconModule, FlTranslateModule} from '@monorepo/front-core-lib';

/**
 * Regrouped all the needed import for this app from library
 *
 * All the module should be in export
 */
@NgModule({
  exports: [
    FlCoreDirectiveModule,

    FlTranslateModule,
    FlDialogModule,
    FlSnackBarModule,
    FlSvgIconModule,
  ]
})
export class CustomLibraryModule {
}
