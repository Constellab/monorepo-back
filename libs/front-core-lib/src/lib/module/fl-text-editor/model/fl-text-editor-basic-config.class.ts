import {FlTextEditorConfig} from './fl-text-editor-config.class';
import {FlQuillConfig, FlTextEditorBlockAddButton, FlTextEditorSnowButton} from './fl-text-editor.class';
import {FlTextEditorState} from '../state/fl-text-editor.state';

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

  onPasteImage(imgFile: File, state: FlTextEditorState): any {
    return null;
  }

  getSnowButtons(): FlTextEditorSnowButton[] {
    return [];
  }

}
