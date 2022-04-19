import {FlTextEditorConfig} from './fl-text-editor-config.class';
import {FlQuillConfig, FlTextEditorBlockAddButton} from './fl-text-editor.class';

/**
 * Basic config for the TextEditor no add block button and minimum toolbar actions
 */
export class FlTextEditorBasicConfig extends FlTextEditorConfig {
  getBlockAddButtons(): FlTextEditorBlockAddButton[] {
    return [];
  }

  getToolbarConfig(): any {
    return FlQuillConfig.simpleToolbarConfig;
  }
}
