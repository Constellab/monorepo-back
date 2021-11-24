import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlTextEditorComponent} from './component/fl-text-editor/fl-text-editor.component';


@NgModule({
  declarations: [
    FlTextEditorComponent,
  ],
  exports: [
    FlTextEditorComponent,
  ],
  imports: [
    CommonModule
  ],
})
export class FlTextEditorModule {
}
