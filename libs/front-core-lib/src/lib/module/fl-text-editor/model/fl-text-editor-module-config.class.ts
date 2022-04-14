/**
 * Config for the {@link FlTextEditorModule}
 */
import {Type} from '@angular/core';

export interface FlTextEditorModuleConfig {
  blots: FlTextEditorModuleConfigBlot[];
}

export interface FlTextEditorModuleConfigBlot {
  blot: any;
  componentType: Type<any>;
  type: 'block';
  addIcon: string;
  addTooltip: string;
}
