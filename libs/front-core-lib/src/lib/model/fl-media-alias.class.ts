/**
 * Type for media breakpoint from FlexLayout
 */
export type FlMediaBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Type for media breakpoint rules lower than from FlexLayout
 */
export type FlMediaLowerBreakpoint = 'lt-sm' | 'lt-md' | 'lt-lg' | 'lt-xl';

/**
 * Type for media breakpoint rules greater than from FlexLayout
 */
export type FlMediaGreaterBreakpoint = 'gt-xs' | 'gt-sm' | 'gt-md' | 'gt-lg';

/**
 * Type for all media aliases from FlexLayout
 */
export type FlMediaAlias = FlMediaBreakpoint | FlMediaLowerBreakpoint | FlMediaGreaterBreakpoint;

/**
 * Object where keys are media aliases from {@link FlMediaAlias}
 *
 * @example {'md': any, 'lt-md': any, 'gt-md': any}
 */
export type FlMediaObject<T = any> = {
  [P in FlMediaAlias]?: T;
};
