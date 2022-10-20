import {NgModule} from '@angular/core';
import {
  FlApiModule,
  FlArticleModule,
  FlAuthModule,
  FlCardModule, FlColorModule,
  FlCoreComponentModule,
  FlCoreDirectiveModule,
  FlCorePipeModule,
  FlDateModule,
  FlDialogModule,
  FlDrawerModule,
  FlDynamicFieldModule,
  FlFormModule,
  FlIconModule,
  FlImageModule,
  FlInfiniteScrollModule,
  FlInputFileModule,
  FlJsonEditorModule,
  FlKeyValueModule,
  FlLoaderModule,
  FlMenuDynamicModule,
  FlPortalActionsModule,
  FlPortalModule,
  FlSectionModule,
  FlSnackBarModule,
  FlStatusModule,
  FlTextEditorModule,
  FlTextIconModule,
  FlTranslateModule,
  FlUserModule
} from '@monorepo/front-core-lib';
import {RvResourceViewModule} from '@monorepo/resource-view';
import {PrProtocolModule} from '@monorepo/protocol';

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
    FlPortalModule,
    FlKeyValueModule,
    FlInputFileModule,
    FlDynamicFieldModule,
    FlUserModule,
    FlMenuDynamicModule,
    FlDrawerModule,
    FlColorModule,


    RvResourceViewModule,
    PrProtocolModule,
  ]
})
export class CaCustomLibraryModule {

}
