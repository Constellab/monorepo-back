/**
 * Static class containing config for Quill
 */
import {QuillToolbarConfig} from 'ngx-quill';

export class FlQuillConfig {

  /**
   * Default toolbar config to enable tools
   */
  public static defaultToolbarConfig: QuillToolbarConfig = [
    ['bold', 'italic', 'underline', 'strike'],
    [{list: 'ordered'}, {list: 'bullet'}],
    [{align: []}, {color: ['#000', '#e60000', '#ff9900', '#008a00', '#0066cc', '#9933ff']}],
    [{indent: '-1'}, {indent: '+1'}],
    ['link', 'blockquote', 'clean'],
  ];
}
