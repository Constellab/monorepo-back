export type CnProjectAncestorType = 'project' | 'experiment' | 'report'

export interface CnProjectAncestorTreeDTO {
  id: string;
  title: string;
  type: CnProjectAncestorType;
}
