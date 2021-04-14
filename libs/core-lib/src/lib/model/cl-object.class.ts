/**
 * Interface that represent an object (Similar to Object but can be configured with the generic)
 */
export interface ClObject<T = any> {
  [k: string]: T
}
