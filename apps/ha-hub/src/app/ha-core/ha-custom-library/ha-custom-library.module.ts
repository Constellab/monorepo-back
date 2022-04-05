import {NgModule} from '@angular/core';
import {
  FlArticleModule,
  FlAuthModule,
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
  FlTranslateModule,
  FlUserModule
} from '@monorepo/front-core-lib';

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
    FlUserModule
  ]
})
export class HaCustomLibraryModule {
}
