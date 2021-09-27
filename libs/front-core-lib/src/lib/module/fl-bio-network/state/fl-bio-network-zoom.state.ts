import {Injectable, OnDestroy} from '@angular/core';
import {FlD3SelectionSimple, FlD3ZoomEvent} from '../../fl-chart/model/fl-d3.class';
import {ZoomBehavior, ZoomTransform} from 'd3-zoom';
import * as d3 from 'd3';
import {BehaviorSubject, Observable} from 'rxjs';
import {filter} from 'rxjs/operators';

/**
 * State to manage the zoom in the {@link FlBioNetworkComponent}
 */
@Injectable()
export class FlBioNetworkZoomState implements OnDestroy {

  public svg: FlD3SelectionSimple;
  private zoomableElement: FlD3SelectionSimple;
  public zoomHandler: ZoomBehavior<any, any>;

  private zoom$: BehaviorSubject<ZoomTransform> = new BehaviorSubject(null);

  public readonly minZoomScale: number = 0.1;
  public readonly maxZoomScale: number = 10;


  public enableZoom(svg: FlD3SelectionSimple, zoomableElement: FlD3SelectionSimple): void {
    this.zoomableElement = zoomableElement;
    this.svg = svg;

    //add zoom capabilities
    this.zoomHandler = d3.zoom()
      .on('zoom', (event: FlD3ZoomEvent) => this.onZoom(event.transform))
      .scaleExtent([this.minZoomScale, this.maxZoomScale]);

    // init the zoom with a value if
    if (this.currentZoom) {
      this.zoomHandler.transform(svg, this.currentZoom);
    }


    this.zoomHandler(svg);
  }

  //Zoom functions
  private onZoom(transform: ZoomTransform): void {
    this.zoomableElement.attr('transform', transform.toString());

    // emit the zoom
    this.zoom$.next(transform);
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
