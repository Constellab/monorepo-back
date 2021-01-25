import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlJsonEditorInputComponent} from './fl-json-editor-input/fl-json-editor-input.component';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import {FlSnackBarModule} from '../fl-snack-bar/fl-snack-bar.module';
import {FlCoreDirectiveModule} from '../fl-core-directive/fl-core-directive.module';
import {FlJsonEditorDialogComponent} from './fl-json-editor-dialog/fl-json-editor-dialog.component';
import {FlJsonEditorDirective} from './fl-json-editor.directive';
import {MatDialogModule} from '@angular/material/dialog';
import {FlDialogModule} from '../fl-dialog/fl-dialog.module';

/**
 * Module containing a component to edit json in html
 */
@NgModule({
  declarations: [
    FlJsonEditorInputComponent,
    FlJsonEditorDialogComponent,
    FlJsonEditorDirective
  ],
  exports: [
    FlJsonEditorInputComponent
  ],
  imports: [
    CommonModule,

    FlDialogModule,
    MatDialogModule,
    FlTranslateModule,
    FlSnackBarModule,
    FlCoreDirectiveModule,
  ]
})
export class FlJsonEditorModule {
}
