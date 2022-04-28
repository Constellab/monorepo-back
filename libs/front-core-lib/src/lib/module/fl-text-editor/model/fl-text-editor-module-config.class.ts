/**
 * Config for the {@link FlTextEditorModule}
 */
import {Type} from '@angular/core';
import {FlTextEditorElementDirective} from './fl-text-editor-element.directive';

export interface FlTextEditorModuleConfig {
  blots: FlTextEditorModuleConfigBlot[];
}

export interface FlTextEditorModuleConfigBlot {
  blot: any;
  componentType: Type<FlTextEditorElementDirective>;
}
