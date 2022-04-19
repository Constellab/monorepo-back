import {FlTextEditorState} from '../state/fl-text-editor.state';
import {FlTextEditorBlockAddButton} from './fl-text-editor.class';

/**
 * Config for the TextEditor component. It needs to be provided to the component.
 */
export abstract class FlTextEditorConfig {

  public abstract getToolbarConfig(): any;

  public abstract getBlockAddButtons(state: FlTextEditorState): FlTextEditorBlockAddButton[];

  protected getCodeBlockAddButton(state: FlTextEditorState): FlTextEditorBlockAddButton {
    return {
      icon: 'code',
      type: 'button',
      onAction: () => state.insertCodeBlock()
    };
  }

  protected getQuoteBlockAddButton(state: FlTextEditorState): FlTextEditorBlockAddButton {
    return {
      icon: 'format_quote',
      type: 'button',
      onAction: () => state.insertBlockQuote()
    };
  }

}
