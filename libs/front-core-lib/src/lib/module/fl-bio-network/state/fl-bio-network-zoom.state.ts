import {Injectable, NgZone, OnDestroy} from '@angular/core';
import {FlD3SelectionSimple, FlD3ZoomEvent} from '../../fl-chart/model/fl-d3.class';
import {ZoomBehavior, ZoomTransform} from 'd3-zoom';
import {BehaviorSubject, Observable} from 'rxjs';
import {filter} from 'rxjs/operators';
import {FlCoord} from '../../../model/shared/fl-coord.class';
import {zoom, zoomIdentity} from 'd3';
import {FlBioNetworkD3} from '../model/fl-bio-network-d3.class';

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

  // Default zoom scale when zooming to a position
  private readonly zoomToPositionScale: number = 0.5;
  // Scale use when we zoom to multiple positions
  private readonly zoomToMultiplePositionScale: number = 0.3;

  // true after the enable zoom and false after first zoom handling
  private firstZoom: boolean = true;

  // store the lowest level of all the data. The lowest level should always be visible
  private lowestLevel: number = 1;

  constructor(private ngZone: NgZone) {
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
      // init the zoom default value
      const defaultZoom = zoomIdentity.translate(875, 385).scale(0.5);
      this.zoomHandler.transform(svg, defaultZoom);
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

    // emit the zoom
    this.zoom$.next(transform);
    this.firstZoom = false;
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

  public zoomToPositions(coords: FlCoord[]): void {
    let minX = coords[0].x;
    let minY = coords[0].y;
    let maxX = coords[0].x;
    let maxY = coords[0].y;
    for (let i = 1; i < coords.length; i++) {
      if (coords[i].x < minX) minX = coords[i].x;
      if (coords[i].y < minY) minY = coords[i].y;
      if (coords[i].x > maxX) maxX = coords[i].x;
      if (coords[i].y > maxY) maxY = coords[i].y;
    }

    const x = (minX + maxX) / 2;
    const y = (minY + maxY) / 2;
    this.zoomToPosition(x, y, this.zoomToMultiplePositionScale);
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
