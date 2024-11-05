export interface BlRichTextI {
  ops: BlRichTextOp[];
}

export interface BlRichTextOp {
  insert: any;
  attributes?: any;
}
