import {FlTextEditorState} from '../state/fl-text-editor.state';
import {FlTextEditorBlockAddButton, FlTextEditorSnowButton} from './fl-text-editor.class';
import {FlDialogService} from '../../fl-dialog/fl-dialog.service';
import {
  FlTextEditorLinkDialogComponent,
  FlTextEditorLinkDialogInput
} from '../component/fl-text-editor-link-dialog/fl-text-editor-link-dialog.component';
import {
  FlTextEditorFormulaDialogComponent,
  FlTextEditorFormulaDialogInput
} from '../component/fl-text-editor-formula-dialog/fl-text-editor-formula-dialog.component';

/**
 * Config for the TextEditor component. It needs to be provided to the component.
 */
export abstract class FlTextEditorConfig {

  public abstract getToolbarConfig(): any;

  public abstract getBlockAddButtons(state: FlTextEditorState): FlTextEditorBlockAddButton[];

  public abstract getSnowButtons(): FlTextEditorSnowButton[];

  public abstract onPasteImage(imgFile: File, state: FlTextEditorState): any;

  protected getCodeBlockAddButton(state: FlTextEditorState): FlTextEditorBlockAddButton {
    return {
      icon: 'code',
      type: 'button',
      onAction: () => state.insertCodeBlock()
    };
  }

  public getTheme(themeMode: 'VISIBLE_BUTTON' | 'OVERRIDE_BUTTON'): 'snow' | 'bubble' {
    return themeMode === 'VISIBLE_BUTTON' ? 'snow' : 'bubble';
  }

  protected getHintBlockAddButton(state: FlTextEditorState): FlTextEditorBlockAddButton {
    return {
      icon: 'info',
      type: 'button',
      children: [
        {icon: 'info', type: 'button', tooltip: 'flTextEditor.hint_classic', onAction: () => state.insertHint('info')},
        {
          icon: 'warnings',
          type: 'button',
          tooltip: 'flTextEditor.hint_warning',
          onAction: () => state.insertHint('warning')
        },
        {
          icon: 'biotech',
          type: 'button',
          tooltip: 'flTextEditor.hint_scientific',
          onAction: () => state.insertHint('science')
        }
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

  protected getVideoAddButton(state: FlTextEditorState, dialogService: FlDialogService): FlTextEditorBlockAddButton {
    return {
      icon: 'play_arrow',
      type: 'button',
      onAction: () => this.addVideo(state, dialogService)
    };
  }

  private addVideo(state: FlTextEditorState, dialogService: FlDialogService): void {
    const data: FlTextEditorLinkDialogInput = {
      title: 'flTextEditor.add_a_video',
    };
    const index = state.getCurrentSelectionIndex();
    dialogService.openSmallDialog(FlTextEditorLinkDialogComponent, {data: data}).afterClosed().subscribe(
      (url: string) => {
        if (url) {
          state.insertVideo(url, index);
        }
      });
  }

  protected getFormulaAddButton(state: FlTextEditorState, dialogService: FlDialogService): FlTextEditorBlockAddButton {
    return {
      icon: 'functions',
      type: 'button',
      onAction: () => this.addFormula(state, dialogService),
      tooltip: 'flTextEditor.add_formula'
    };
  }

  private addFormula(state: FlTextEditorState, dialogService: FlDialogService): void {
    const index = state.getCurrentSelectionIndex();

    const input: FlTextEditorFormulaDialogInput = {
      mode: 'create'
    };
    dialogService.openSmallDialog(FlTextEditorFormulaDialogComponent, {data: input}).afterClosed().subscribe(
      (formula: string) => {
        if (formula) {
          state.insertFormula(formula, index);
        }
      });
  }


}

