import {NgModule} from '@angular/core';
import {
  FlApiModule,
  FlArticleModule,
  FlAuthModule,
  FlCardModule,
  FlCoreComponentModule,
  FlCoreDirectiveModule,
  FlCorePipeModule,
  FlDateModule,
  FlDialogModule,
  FlFormModule,
  FlIconModule,
  FlImageModule,
  FlInfiniteScrollModule,
  FlJsonEditorModule,
  FlKeyValueModule,
  FlLoaderModule,
  FlPortalActionsModule,
  FlSectionModule,
  FlSnackBarModule,
  FlStatusModule,
  FlTextEditorModule,
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
    FlIconModule,
    FlSectionModule,
    FlTextIconModule,
    FlDialogModule,
    FlSnackBarModule,
    FlJsonEditorModule,
    FlStatusModule,
    FlInfiniteScrollModule,
    FlDateModule,
    FlAuthModule,
    FlTextEditorModule,
    FlArticleModule,
    FlPortalActionsModule,
    FlKeyValueModule,
  ]
})
export class CaCustomLibraryModule {
}
