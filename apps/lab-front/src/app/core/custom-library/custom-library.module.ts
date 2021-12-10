import {NgModule} from '@angular/core';
import {
  FlAuthModule,
  FlBioNetworkModule,
  FlCardModule,
  FlChartModule,
  FlCoreComponentModule,
  FlCoreDirectiveModule,
  FlCorePipeModule,
  FlDateModule,
  FlDialogModule,
  FlDrawerModule,
  FlDynamicFieldModule,
  FlFormInputsManagerModule,
  FlFormModule,
  FlInfiniteScrollModule,
  FlInputFileModule,
  FlJsonEditorModule,
  FlLoaderModule,
  FlPortalActionsModule,
  FlPortalModule,
  FlSearchModule,
  FlSectionModule,
  FlSnackBarModule,
  FlSpreadsheetModule,
  FlStatusModule,
  FlSvgIconModule,
  FlTagModule,
  FlTextEditorModule,
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
    FlSpreadsheetModule,
    FlChartModule,
    FlInputFileModule,
    FlPortalActionsModule,
    FlDateModule,
    FlAuthModule,
    FlBioNetworkModule,
    FlDrawerModule,
    FlTagModule,
    FlTextEditorModule,
    FlFormInputsManagerModule,
    FlSearchModule,
  ]
})
export class CustomLibraryModule {
}
