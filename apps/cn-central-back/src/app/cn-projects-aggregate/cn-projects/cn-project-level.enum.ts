
export enum CnProjectLevelStatus{
  /**
   * Project that contains subproject. No object (experiment, report) can be associated to it
   */
  PARENT = 'PARENT',

  /**
   * Leaf project, no subproject can be associated to it. Object (experiment, report) can be associated to it
   */
  LEAF = 'LEAF',
}
