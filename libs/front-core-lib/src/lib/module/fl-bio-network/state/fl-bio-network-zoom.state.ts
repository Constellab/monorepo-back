import {Injectable, NgZone, OnDestroy} from '@angular/core';
import {FlD3SelectionSimple, FlD3ZoomEvent} from '../../fl-chart/model/fl-d3.class';
import {ZoomBehavior, ZoomTransform} from 'd3-zoom';
import {BehaviorSubject, Observable} from 'rxjs';
import {filter} from 'rxjs/operators';
import {flBioNetworkNodeTextClass} from '../model/fl-bio-network-d3-node.class';
import {FlBioNetworkGroupState} from './fl-bio-network-group.state';
import {FlCoord} from '../../../model/shared/fl-coord.class';
import {zoom, zoomIdentity} from 'd3';
import {FlBioNetworkD3} from '../model/fl-bio-network-d3.class';

/**
 * Different threshold for D3 object levels
 */
const d3ObjectZoomLevelThreshold = {
  1: 0, // levels 0 are always showed
  2: 1, // level 2 showed when zoom > 1
  3: 3 // level 3 are showed if zoom > 3
};

/**
 * State to manage the zoom in the {@link FlBioNetworkComponent}
 */
@Injectable()
export class FlBioNetworkZoomState implements OnDestroy {

  public svg: FlD3SelectionSimple;
  private zoomableElement: FlD3SelectionSimple;
  private svgWidth: number;
  private svgHeight: number;

  public zoomHandler: ZoomBehavior<any, any>;

  private zoom$: BehaviorSubject<ZoomTransform> = new BehaviorSubject(null);

  public readonly minZoomScale: number = 0.1;
  public readonly maxZoomScale: number = 10;

  // zoom threshold where the node-text are displayed
  // if zoom >= threshold --> text is displayed
  private readonly nodeTextVisibilityThreshold = 0.7;

  // Default zoom scale when zooming to a position
  private readonly zoomToPositionScale: number = 3;

  // true after the enable zoom and false after first zoom handling
  private firstZoom: boolean = true;

  // store the lowest level of all the data. The lowest level should always be visible
  private lowestLevel: number = 1;

  constructor(private ngZone: NgZone, private groupState: FlBioNetworkGroupState) {
  }


  public enableZoom(svg: FlD3SelectionSimple, zoomableElement: FlD3SelectionSimple,
                    svgWidth: number, svgHeight: number, data: FlBioNetworkD3): void {
    this.zoomableElement = zoomableElement;
    this.svg = svg;
    this.svgWidth = svgWidth;
    this.svgHeight = svgHeight;
    this.firstZoom = true;
    this.lowestLevel = data.getLowestLevel();

    //add zoom capabilities
    this.zoomHandler = zoom()
      .on('zoom', (event: FlD3ZoomEvent) => this.onZoom(event.transform))
      .scaleExtent([this.minZoomScale, this.maxZoomScale]);

    // init the zoom with a value if
    if (this.currentZoom) {
      this.zoomHandler.transform(svg, this.currentZoom);
    } else {
      // this.updateObjectVisibility(1);
      this.firstZoom = false;
    }

    // run the zoom handler outside ng zone to avoid ng check
    this.ngZone.runOutsideAngular(() => {
      this.zoomHandler(svg);
    });
  }

  //Zoom functions
  private onZoom(transform: ZoomTransform): void {
    this.zoomableElement.attr('transform', transform.toString());

    // this.updateObjectVisibility(transform.k);

    // emit the zoom
    this.zoom$.next(transform);
    this.firstZoom = false;
  }

  private updateObjectVisibility(zoomScale: number): void {

    // get the current zoom level based on current scale
    // Make the current level equal of higher than lowest level so the lowest level are always shown
    const currentLevel = Math.max(this.getObjectLevelFromScale(zoomScale), this.lowestLevel);

    // update the zoom visibility if there were no zoom previously or the zoom level has changed
    const updateVisibility: boolean = this.firstZoom
      || this.getObjectLevelFromScale(this.getCurrentScale()) != currentLevel;

    if (updateVisibility) {
      this.groupState.allObjects.each(d => d.visible = d.getLevel() <= currentLevel)
        .style('opacity', (d => d.visible ? 1 : 0));
    }
  }

  // show or hide the text based on scroll scale
  private updateNodeTextVisibility(zoomScale: number): void {
    const previousDisplay = this.getCurrentScale() >= this.nodeTextVisibilityThreshold;
    const currentDisplay = zoomScale >= this.nodeTextVisibilityThreshold;

    if (previousDisplay != currentDisplay) {
      const opacity = currentDisplay ? 1 : 0;
      this.svg.selectAll('.' + flBioNetworkNodeTextClass).style('opacity', opacity);
    }
  }

  /**
   * Method to zoom to a position
   * @param posX
   * @param posY
   * @param scale zoom scale
   */
  public zoomToPosition(posX: number, posY: number, scale: number = this.zoomToPositionScale): void {
    this.svg.transition()
      .duration(750)
      .call(this.zoomHandler.transform,
        zoomIdentity
          .translate(this.svgWidth * 0.5 - scale * posX,
            this.svgHeight * 0.5 - scale * posY)
          .scale(scale));
  }

  private getCurrentScale(): number {
    return this.zoom$.value?.k ?? 1;
  }

  // public resetZoom(): void{
  //   let newZoom = this.currentZoom.scale(1 /this.currentZoom.k );
  //   console.log(newZoom.x);
  //   newZoom = newZoom.translate(0,0);
  //   console.log(newZoom);
  // }

  // public zoom(zoom: number): void {
  //   console.log(this.currentZoom.applyX(850));
  //   console.log(this.currentZoom.invertX(850));
  //
  //   let newZoom = this.currentZoom.scale(zoom);
  //   console.log(newZoom.applyX(850));
  //   console.log(newZoom.invertX(850));
  //
  //   const diff = this.currentZoom.k / newZoom.k;
  //   console.log(diff);
  //   newZoom = newZoom.translate(this.currentZoom.x * diff, this.currentZoom.y * diff);
  //   console.log(this.currentZoom, newZoom);
  //   this.zoomHandler.transform(this.svg, newZoom);
  // }
  //
  public getZoom$(): Observable<ZoomTransform> {
    return this.zoom$.asObservable().pipe(
      filter(zoom => zoom != null)
    );
  }

  public get currentZoom(): ZoomTransform | null {
    return this.zoom$.value;
  }

  // retrieve the Object level to show based on current zoom scale
  public getObjectLevelFromScale(scale: number): number {
    let level = 0;

    while (scale > d3ObjectZoomLevelThreshold[level + 1]) {
      level++;
    }
    return level;
  }

  public convertCoord(coord: FlCoord): FlCoord {
    if (this.zoom$.value == null) return coord;

    const result = this.zoom$.value.invert([coord.x, coord.y]);
    return {
      x: result[0],
      y: result[1]
    };
    // console.log(this.zoom$.value.apply([coord.x, coord.y]))
    // return null;
  }


  ngOnDestroy(): void {
    this.zoom$.complete();
  }


}
