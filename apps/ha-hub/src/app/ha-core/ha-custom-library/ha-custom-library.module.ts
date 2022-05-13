import {NgModule} from '@angular/core';
import {
  FlArticleModule,
  FlAuthModule,
  FlCoreComponentModule,
  FlCoreDirectiveModule,
  FlCorePipeModule,
  FlDialogModule,
  FlFormModule,
  FlIconModule,
  FlLoaderModule,
  FlMenuDynamicModule,
  FlPortalModule,
  FlSectionModule,
  FlSnackBarModule,
  FlTextEditorModule,
  FlTextIconModule,
  FlTranslateModule,
  FlUserModule
} from '@monorepo/front-core-lib';
import {TdTechnicalDocModule} from '@monorepo/technical-doc';

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
    FlTextEditorModule,
    FlMenuDynamicModule,
    FlIconModule,
    FlArticleModule,
    FlUserModule,
    FlTextIconModule,
    FlCoreComponentModule,

    //-------------------

    TdTechnicalDocModule
  ]
})
export class HaCustomLibraryModule {
}
