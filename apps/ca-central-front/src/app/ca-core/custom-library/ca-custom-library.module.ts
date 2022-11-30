import {NgModule} from '@angular/core';
import {
  FlApiModule,
  FlArticleModule,
  FlAuthModule,
  FlCardModule,
  FlColorModule,
  FlCoreComponentModule,
  FlCoreDirectiveModule,
  FlCorePipeModule,
  FlDateModule,
  FlDialogModule,
  FlDrawerModule,
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
import {
  FlEmojiPickerModule
} from '../../../../../../libs/front-core-lib/src/lib/module/fl-emoji-picker/fl-emoji-picker.module';

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
    FlUserModule,
    FlMenuDynamicModule,
    FlDrawerModule,
    FlColorModule,
    FlEmojiPickerModule,


    RvResourceViewModule,
    PrProtocolModule,
  ]
})
export class CaCustomLibraryModule {

}
