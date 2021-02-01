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
import { FlPrettyJsonComponent } from './fl-pretty-json/fl-pretty-json.component';
import {MatTreeModule} from '@angular/material/tree';
import {MatIconModule} from '@angular/material/icon';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FlTextIconModule} from '../fl-text-icon/fl-text-icon.module';

/**
 * Module containing a component to edit json in html
 */
@NgModule({
  declarations: [
    FlJsonEditorInputComponent,
    FlJsonEditorDialogComponent,
    FlJsonEditorDirective,
    FlPrettyJsonComponent
  ],
  exports: [
    FlJsonEditorInputComponent,
    FlJsonEditorDirective,
    FlPrettyJsonComponent,
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
}
