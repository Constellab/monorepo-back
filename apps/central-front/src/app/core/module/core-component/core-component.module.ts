import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CustomMaterialModule} from '../../custom-material/custom-material.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {JsonEditorComponent} from './component/json-editor/json-editor.component';
import {RouterModule} from '@angular/router';
import {CustomLibraryModule} from '../../lib/custom-library.module';

/**
 * Core modules containing components
 */
@NgModule({
  declarations: [
    JsonEditorComponent,
  ],
  exports: [
    JsonEditorComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    CustomMaterialModule,
    CustomLibraryModule,
  ]
})
export class CoreComponentModule {
}
