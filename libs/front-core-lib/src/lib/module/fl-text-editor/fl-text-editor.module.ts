import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlTextEditorComponent} from './component/fl-text-editor/fl-text-editor.component';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {
  FlTextEditorBlockAddButtonComponent
} from './component/fl-text-editor-block-add-button/fl-text-editor-block-add-button.component';
import {FlPortalModule} from '../fl-portal/fl-portal.module';
import {FlInputFileModule} from '../fl-input-file/fl-input-file.module';
import {FlCoreDirectiveModule} from '../fl-core-directive/fl-core-directive.module';


@NgModule({
  declarations: [
    FlTextEditorComponent,
    FlTextEditorBlockAddButtonComponent,
  ],
  exports: [
    FlTextEditorComponent,
  ],
  imports: [
    CommonModule,

    MatButtonModule,
    MatIconModule,
    FlPortalModule,
    FlInputFileModule,
    FlCoreDirectiveModule,
  ],
})
export class FlTextEditorModule {
}
