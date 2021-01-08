/**
 * Event trigger on drop file by {@link FlDragHoverDirective}
 */
export interface FlDropFileEvent {
  files: File[];
  event: DragEvent;
}
