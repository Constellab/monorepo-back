import {JSONEditorMode} from 'jsoneditor';

export interface FlJsonEditorConfig {
  enableSort: boolean;
  enableTransform: boolean;
  escapeUnicode: boolean;
  sortObjectKeys: boolean;
  history: boolean;
  mode?: JSONEditorMode;
  modes?: JSONEditorMode[];
  name?: string;
  schema?: any;
  search: boolean;
  indentation: number;
  template?: any;
  theme?: string;
  language?: string;
  languages?: any;
}

export const flDefaultJsonEditorConfig: FlJsonEditorConfig = {
  enableSort: false,
  enableTransform: false,
  escapeUnicode: false,
  sortObjectKeys: false,
  history: true,
  mode: 'code',
  search: false,
  indentation: 2
};
