import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlJsonEditorComponent} from './fl-json-editor/fl-json-editor.component';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import {FlSnackBarModule} from '../fl-snack-bar/fl-snack-bar.module';
import {FlCoreDirectiveModule} from '../fl-core-directive/fl-core-directive.module';

/**
 * Module containing a component to edit json in html
 */
@NgModule({
  declarations: [
    FlJsonEditorComponent
  ],
  exports: [
    FlJsonEditorComponent
  ],
  imports: [
    CommonModule,

    FlTranslateModule,
    FlSnackBarModule,
    FlCoreDirectiveModule,
  ]
})
export class FlJsonEditorModule {
}
