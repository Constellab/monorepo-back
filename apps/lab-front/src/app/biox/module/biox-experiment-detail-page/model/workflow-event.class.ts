import {WorkflowConnection} from './workflow-connection.class';

export interface WorkflowConnectionSelected {
  event: MouseEvent;
  connection: WorkflowConnection;
}
