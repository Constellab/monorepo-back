/**
 * Event trigger on drop file by {@link DragHoverDirective}
 */
export interface DropFileEvent {
  files: File[];
  event: DragEvent;
}
