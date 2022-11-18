/**
 * Config to show a button in the add block menu
 */
import {FlTextEditorState} from '../state/fl-text-editor.state';

export interface FlTextEditorBlockAddButton {
  icon: string;
  tooltip?: string;
  type: 'button' | 'fileExplorer';
  children?: FlTextEditorBlockAddButton[];
  onAction?: (event: any) => void;
}

export interface FlTextEditorSnowButton{
  icon: string;
  tooltip?: string;
  disabled?: boolean;
  type: 'button' | 'fileExplorer';
  onAction?: (event: any, state: FlTextEditorState) => void;
}

/**
 * Static class containing config for Quill
 */
export class FlQuillConfig {

  /**
   * Complete toolbar config to enable tools
   * See https://quilljs.com/docs/modules/toolbar/
   */
  public static completeToolbarConfig: any[] = [
    ['bold', 'italic', 'underline', 'strike'],
    [{list: 'ordered'}, {list: 'bullet'}],
    [{header: [2, 3, 4, false]}],
    [{align: []}, {color: ['#000', '#e60000', '#ff9900', '#008a00', '#0066cc', '#9933ff']}],
    [{indent: '-1'}, {indent: '+1'}],
    ['link', 'blockquote', 'code', 'clean'],
  ];

  public static simpleToolbarConfig: any[] = [
    ['bold', 'italic', 'underline'],
    [{list: 'ordered'}, {list: 'bullet'}],
    [{header: [2, 3, false]}],
    [{color: ['#000', '#e60000', '#ff9900', '#008a00', '#0066cc', '#9933ff']}, 'link', 'clean'],
  ];


}

export interface FlQuillJson {
  ops: any[];
}
