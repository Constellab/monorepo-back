/**
 * Static class containing config for Quill
 */
export class FlQuillConfig {

  /**
   * Default toolbar config to enable tools
   * See https://quilljs.com/docs/modules/toolbar/
   */
  public static defaultToolbarConfig: any[] = [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{list: 'ordered'}, {list: 'bullet'}],
    [{align: []}, {color: ['#000', '#e60000', '#ff9900', '#008a00', '#0066cc', '#9933ff']}],
    [{indent: '-1'}, {indent: '+1'}],
    ['link', 'blockquote', 'clean'],
  ];
}
