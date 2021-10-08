import {Injectable, NgZone, OnDestroy} from '@angular/core';
import {FlD3SelectionSimple, FlD3ZoomEvent} from '../../fl-chart/model/fl-d3.class';
import {ZoomBehavior, ZoomTransform} from 'd3-zoom';
import * as d3 from 'd3';
import {BehaviorSubject, Observable} from 'rxjs';
import {filter} from 'rxjs/operators';
import {flBioNetworkNodeTextClass} from '../model/fl-bio-network-d3.class';

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


  constructor(private ngZone: NgZone) {
  }


  public enableZoom(svg: FlD3SelectionSimple, zoomableElement: FlD3SelectionSimple,
                    svgWidth: number, svgHeight: number): void {
    this.zoomableElement = zoomableElement;
    this.svg = svg;
    this.svgWidth = svgWidth;
    this.svgHeight = svgHeight;

    //add zoom capabilities
    this.zoomHandler = d3.zoom()
      .on('zoom', (event: FlD3ZoomEvent) => this.onZoom(event.transform))
      .scaleExtent([this.minZoomScale, this.maxZoomScale]);

    // init the zoom with a value if
    if (this.currentZoom) {
      this.zoomHandler.transform(svg, this.currentZoom);
    }

    // run the zoom handler outside ng zone to avoid ng check
    this.ngZone.runOutsideAngular(() => {
      this.zoomHandler(svg);
    });
  }

  //Zoom functions
  private onZoom(transform: ZoomTransform): void {
    this.zoomableElement.attr('transform', transform.toString());

    this.updateNodeTextVisibility(transform);

    // emit the zoom
    this.zoom$.next(transform);
  }

  // show or hide the text based on scroll scale
  private updateNodeTextVisibility(transform: ZoomTransform): void {

    const previousScale = this.zoom$.value?.k ?? 1;
    const previousDisplay = previousScale >= this.nodeTextVisibilityThreshold;
    const currentDisplay = transform.k >= this.nodeTextVisibilityThreshold;

    if (previousDisplay != currentDisplay) {
      const opacity = currentDisplay ? 1 : 0;
      const selection = this.svg.selectAll('.' + flBioNetworkNodeTextClass);
      selection.style('opacity', opacity);
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
        d3.zoomIdentity
          .translate(this.svgWidth * 0.5 - scale * posX,
            this.svgHeight * 0.5 - scale * posY)
          .scale(scale));
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

  ngOnDestroy(): void {
    this.zoom$.complete();
  }


}
