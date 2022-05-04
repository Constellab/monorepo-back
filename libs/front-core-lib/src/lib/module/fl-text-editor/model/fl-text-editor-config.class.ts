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

  protected getHintBlockAddButton(state: FlTextEditorState): FlTextEditorBlockAddButton {
    return {
      icon: 'info',
      type: 'button',
      children: [
        {icon: 'info', type: 'button', tooltip: 'flTextEditor.hint_classic', onAction: () => state.insertHint('info')},
        {icon: 'warnings', type: 'button', tooltip: 'flTextEditor.hint_warning', onAction: () => state.insertHint('warning')},
        {icon: 'biotech', type: 'button', tooltip: 'flTextEditor.hint_scientific', onAction: () => state.insertHint('science')}
      ],
    };
  }

  protected getQuoteBlockAddButton(state: FlTextEditorState): FlTextEditorBlockAddButton {
    return {
      icon: 'format_quote',
      type: 'button',
      onAction: () => state.insertBlockQuote()
    };
  }

  protected getFormatClearAddButton(state: FlTextEditorState): FlTextEditorBlockAddButton {
    return {
      icon: 'format_clear',
      type: 'button',
      onAction: () => state.removeFormat()
    };
  }

}
