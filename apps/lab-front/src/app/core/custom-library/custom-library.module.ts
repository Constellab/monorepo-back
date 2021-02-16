import {NgModule} from '@angular/core';
import {
  FlCardModule,
  FlCoreComponentModule,
  FlCoreDirectiveModule,
  FlCorePipeModule,
  FlDialogModule,
  FlDynamicFieldModule, FlFormModule,
  FlInfiniteScrollModule,
  FlJsonEditorModule,
  FlLoaderModule,
  FlPortalModule,
  FlSectionModule,
  FlSnackBarModule,
  FlStatusModule,
  FlSvgIconModule,
  FlTextIconModule,
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
    FlPortalModule,
    FlSvgIconModule,
    FlSectionModule,
    FlCardModule,
    FlTextIconModule,
    FlStatusModule,
    FlInfiniteScrollModule,
    FlLoaderModule,
    FlJsonEditorModule,
    FlDynamicFieldModule,
    FlFormModule,
  ]
})
export class CustomLibraryModule {
}
