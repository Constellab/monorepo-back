// use to redefined some d3 global objects

import {Selection} from 'd3-selection';
import {ZoomTransform} from 'd3-zoom';

/**
 * Event type for zooming in d3 with : d3.zoom()
 */
export interface FlD3ZoomEvent {
  sourceEvent: WheelEvent;
  target: any;
  transform: ZoomTransform;
  type: 'zoom';
}


export interface FlD3Transform {
  k: number;
  x: number;
  y: number;

  toString(): string;
}

export interface FlCoord {
  x: number;
  y: number;
}


/**
 * A simpler selection type where only the data object is configurable
 */
export type FlD3SelectionSimple<T = any> = Selection<any, T, any, any>;

/**
 * Drag event on D3
 */
export interface FlD3DragEvent<T = any> extends DragEvent {
  active: boolean;
  subject: T;
}
