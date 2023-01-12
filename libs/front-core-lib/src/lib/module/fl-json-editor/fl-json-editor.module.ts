import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import {FlSnackBarModule} from '../fl-snack-bar/fl-snack-bar.module';
import {FlCoreDirectiveModule} from '../fl-core-directive/fl-core-directive.module';
import {MatDialogModule} from '@angular/material/dialog';
import {FlDialogModule} from '../fl-dialog/fl-dialog.module';
import {FlPrettyJsonComponent} from './fl-pretty-json/fl-pretty-json.component';
import {MatTreeModule} from '@angular/material/tree';
import {MatIconModule} from '@angular/material/icon';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FlTextIconModule} from '../fl-text-icon/fl-text-icon.module';
import {FlTranslateService} from '../fl-translate/service/fl-translate.service';
import {flJsonEditorI18n} from './i18n/fl-json-editor.i18n';
import {FlPrettyJsonDialogComponent} from './fl-pretty-json-dialog/fl-pretty-json-dialog.component';

/**
 * Module containing a component to edit json in html
 */
@NgModule({
  declarations: [
    FlPrettyJsonComponent,
    FlPrettyJsonDialogComponent
  ],
  exports: [
    FlPrettyJsonComponent,
    FlPrettyJsonDialogComponent,
  ],
  imports: [
    CommonModule,

    MatDialogModule,
    MatTreeModule,
    MatIconModule,
    FlexLayoutModule,
    FlTextIconModule,

    FlDialogModule,
    FlTranslateModule,
    FlSnackBarModule,
    FlCoreDirectiveModule,
  ]
})
export class FlJsonEditorModule {

  constructor(translateService: FlTranslateService) {
    translateService.addModuleTranslation('FlJsonEditorModule', flJsonEditorI18n);
  }
}
