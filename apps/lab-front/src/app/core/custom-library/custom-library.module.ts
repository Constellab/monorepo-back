import {NgModule} from '@angular/core';
import {
  FlCardModule, FlCoreComponentModule,
  FlCoreDirectiveModule,
  FlCorePipeModule,
  FlDialogModule, FlInfiniteScrollModule, FlJsonEditorModule, FlLoaderModule, FlSectionModule,
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
    FlCoreComponentModule,

    FlTranslateModule,
    FlDialogModule,
    FlSnackBarModule,
    FlSvgIconModule,
    FlSectionModule,
    FlCardModule,
    FlTextIconModule,
    FlStatusModule,
    FlInfiniteScrollModule,
    FlLoaderModule,
    FlJsonEditorModule,

  ]
})
export class CustomLibraryModule {
}
