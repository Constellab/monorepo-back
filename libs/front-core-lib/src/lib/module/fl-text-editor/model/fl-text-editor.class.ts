/**
 * Configuration for the text editor
 * complete --> all the options are activated
 * simple --> simple rich text editor without image, align, quote, code...
 */
export type FlTextEditorConfig = 'complete' | 'simple';

/**
 * Static class containing config for Quill
 */
export class FlQuillConfig {

  /**
   * Complete toolbar config to enable tools
   * See https://quilljs.com/docs/modules/toolbar/
   */
  private static completeToolbarConfig: any[] = [
    ['bold', 'italic', 'underline', 'strike'],
    [{list: 'ordered'}, {list: 'bullet'}],
    [{header: [1, 2, 3, 4, false]}],
    [{align: []}, {color: ['#000', '#e60000', '#ff9900', '#008a00', '#0066cc', '#9933ff']}],
    [{indent: '-1'}, {indent: '+1'}],
    ['link', 'blockquote', 'code-block', 'clean'],
  ];

  private static simpleToolbarConfig: any[] = [
    ['bold', 'italic', 'underline'],
    [{list: 'ordered'}, {list: 'bullet'}],
    [{header: [1, 2, false]}],
    [{color: ['#000', '#e60000', '#ff9900', '#008a00', '#0066cc', '#9933ff']}, 'link', 'clean'],
  ];

  public static getToolbarConfig(config: FlTextEditorConfig): any[] {
    if (config === 'complete') {
      return FlQuillConfig.completeToolbarConfig;
    } else {
      return FlQuillConfig.simpleToolbarConfig;
    }
  }

  // show the add button only in complete config
  public static showAddButton(config: FlTextEditorConfig): boolean {
    return config === 'complete';
  }
}

export interface FlQuillJson {
  ops: any[];
}
