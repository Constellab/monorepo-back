export enum CnProjectLevel {
  // main level of the project
  PROJECT = 1,
  // sub-level of the project
  WORK_PACKAGE = 2,
  // sub-level of the work package
  TASK = 3,
}

export enum CnProjectLevelStatus{
  /**
   * Project that contains sub-projects. No object (experiment, report) can be associated to it
   */
  PARENT = 'PARENT',

  /**
   * Leaf project, no sub-project can be associated to it. Object (experiment, report) can be associated to it
   */
  LEAF = 'LEAF',
}
