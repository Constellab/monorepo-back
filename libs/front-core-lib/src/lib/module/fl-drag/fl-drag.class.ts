/**
 * Event trigger on drop by {@link FlDragHoverDirective}
 */
export interface FlDropEvent<T = any> {
  files?: File[];
  data?: T;
  event: DragEvent;
}


export interface FlDragData{
  type: string;
  data: any;
}
