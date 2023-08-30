export enum CnProjectLevel {
  // main level of the project
  PROJECT = 1,

  // max level of the project hierarchy
  MAX_LEVEL = 6,
}

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
