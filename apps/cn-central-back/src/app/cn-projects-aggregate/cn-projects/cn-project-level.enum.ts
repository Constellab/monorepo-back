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
   * It means that the project does not have children not object associated to it.
   * If a sub-project is associated to it, the status will be set to PARENT and no object can be associated to it.
   * If an object is associated to it, or it is the level 3 in the hierarchy,
   * it will have the LEAF status and no sub-project can be associated to it.
   */
  UNDEFINED = 'UNDEFINED',

  /**
   * Project that contains sub-projects. No object (experiment, report) can be associated to it
   */
  PARENT = 'PARENT',

  /**
   * Leaf project, no sub-project can be associated to it. Object (experiment, report) can be associated to it
   */
  LEAF = 'LEAF',
}
