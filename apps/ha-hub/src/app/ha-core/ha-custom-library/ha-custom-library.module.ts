import {NgModule} from '@angular/core';
import {
  FlAuthModule,
  FlCoreDirectiveModule,
  FlCorePipeModule,
  FlDialogModule,
  FlFormModule,
  FlLoaderModule, FlPortalModule,
  FlSectionModule,
  FlSnackBarModule, FlTextEditorModule,
  FlTranslateModule,
  FlContextMenuModule, FlIconModule, FlArticleModule
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
    FlContextMenuModule,
    FlIconModule,
    FlArticleModule,
  ]
})
export class HaCustomLibraryModule {
}
