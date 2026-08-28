export enum TeBlockType {
  PARAGRAPH = 'paragraph',
  FIGURE = 'figure',
  RESOURCE_VIEW = 'resourceView',
  FILE_VIEW = 'fileView',
  LIST = 'list',
  HEADER = 'header',
  CODE = 'code',
  HINT = 'hint',
  TABLE = 'table',
}

export enum TeInlineToolType {
  MENTION = 'te-mention-inline',
}

export type TeBlockData = Record<string, any>;

/**
 * Types taken from @editorjs/editorjs
 */
export interface TeBlock<Data extends TeBlockData = any> {
  /**
   * Unique id of the block
   */
  id?: string;
  /**
   * Tool type
   */
  type: TeBlockType;
  /**
   * Saved Block data
   */
  data: Data;
}

/////////////// LIST ///////////////////

export type TeBlockListType = 'ordered' | 'unordered' | 'checklist';

export interface TeBlockListItem {
  /**
   * list item text content
   */
  content: string;
  /**
   * Meta information of each list item
   */
  meta: any;
  /**
   * sublist items
   */
  items: TeBlockListItem[];
}

export type TeBlockListData = Omit<TeBlockListItem, 'content'> & {
  /**
   * Style of the list tool
   */
  style: TeBlockListType;
};

/////////////// HEADER //////////////////////
/**
 * Header level, there is no H1 because it is the title of the document
 */
export enum TeBlockHeaderLevel {
  HEADER_1 = 2,
  HEADER_2 = 3,
  HEADER_3 = 4,
}

/**
 * Optional metadata carried by a block.
 * The concrete config/permission types live in the back-only `TeMetadataBlockConfig`
 * (outside this shared `lib/` folder). Here we only keep the structural shape so the
 * shared blocks stay self-contained.
 */
export interface TeBlockWithMetadata {
  metadata?: {
    appRoute?: string;
    permission?: string;
  };
}

export interface TeBlockHeaderData extends TeBlockWithMetadata {
  text: string;
  level: number;
}

/////////////// FIGURE //////////////////////
/**
 * Required information for a new upload image
 */
export interface TeBlockFigureUploadedResponse {
  filename: string;
  width: number;
  height: number;
}

export interface TeBlockFigureData {
  caption: string;
  filename: string;
  title: string;
  height: number;
  width: number;
  naturalHeight: number;
  naturalWidth: number;
}

/////////////// FILE //////////////////////
export interface TeBlockFileUploadResponse {
  name: string;
  size: number; // in bytes
}

///////////////////// VIEW //////////////////////

export interface TeBlockViewData {
  id: string;
  view_config_id?: string;
  resource_id?: string;
  scenario_id?: string;
  view_method_name: string;
  view_config: any;
  title: string;
  caption: string;
}

export interface TeBlockFileViewData {
  id: string;
  title: string;
  caption: string;
}

/////////////// TABLE //////////////////////
export interface TeBlockTableData {
  withHeadings: boolean;
  stretched: boolean;
  content: string[][];
}

/////////////// CODE //////////////////////
/**
 * The languages the code block's editor offers. A block carrying anything else renders
 * unhighlighted, so an unknown value is normalized rather than kept.
 */
export enum TeBlockCodeLanguage {
  PYTHON = 'python',
  TYPESCRIPT = 'typescript',
  JAVASCRIPT = 'javascript',
  JSON = 'json',
  BASH = 'bash',
  YAML = 'yaml',
  PLAINTEXT = 'plaintext',
}

export interface TeBlockCodeData {
  /**
   * The code, as plain text. The renderer escapes it, so it is never sanitized:
   * a sample legitimately contains angle brackets.
   */
  code: string;
  language: TeBlockCodeLanguage;
}

/////////////// HINT //////////////////////
export enum TeBlockHintType {
  INFO = 'info',
  WARNING = 'warning',
  SCIENCE = 'science',
}

/**
 * A hint has exactly these two fields. Anything else (a `title`, a `message`, a `text`)
 * is stored but rendered by nothing, so the block would show up empty.
 */
export interface TeBlockHintData {
  hintType: TeBlockHintType;
  /** Plain text: the hint's renderer does not interpret HTML. */
  content: string;
}
