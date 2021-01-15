export interface FlStatus {

  /**
   * Get the status name
   */
  getStatusName(): string;

  getStatusClassColor(mode: 'background' | 'text'): string;

  getStatusIcon(): string;
}

/**
 * Method to get a status color based on the status
 */
export type FlGetStatusClassColorFunction = (status: any,
                                             mode: 'background' | 'text') => string;

/**
 * Method to get a status icon based on the status
 */
export type FlGetStatusIconFunction = (status: any) => string;
