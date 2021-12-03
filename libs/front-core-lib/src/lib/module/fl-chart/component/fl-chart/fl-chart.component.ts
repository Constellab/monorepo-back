import {Component, ElementRef, HostListener, Input, NgZone, OnDestroy, OnInit} from '@angular/core';
import {FlThemeService} from '../../../../service/fl-theme.service';
import {FlChartState} from '../../state/fl-chart.state';
import {FlMenuDynamic} from '../../../fl-menu-dynamic/model/fl-menu-dynamic.class';
import {ClHelpService} from '@monorepo/core-lib';
import {FlMenuDynamicService} from '../../../fl-menu-dynamic/fl-menu-dynamic.service';
import {FlChartConfig} from '../../model/fl-chart-config.class';
import {debounceTime, filter, map} from 'rxjs/operators';
import {FlResizeObservable} from '../../../../model/fl-resize-observable.class';

/**
 * Component to show a chart, must be included in the FlChartContainer
 *
 * The FlChartState must be provider by the parent
 */
@Component({
  selector: 'fl-chart',
  templateUrl: './fl-chart.component.html',
  styleUrls: ['./fl-chart.component.scss'],
  providers: [FlChartState]
})
export class FlChartComponent implements OnInit, OnDestroy {


  @Input() chart: FlChartConfig;


  /**
   * If provided, it appends the item to the context menu
   */
  @Input() contextMenuItems: FlMenuDynamic[];

  private previousWidth: number;
  private previousHeight: number;

  private resizeObs: FlResizeObservable;

  @HostListener('contextmenu', ['$event'])
  contextMenu(event: MouseEvent): void {
    ClHelpService.stopEventPropagation(event);
    this.openContextMenu(event);
  }

  constructor(private themeService: FlThemeService,
              private state: FlChartState,
              private menuService: FlMenuDynamicService,
              private elementRef: ElementRef<HTMLElement>,
              private ngZone: NgZone) {
  }

  ngOnInit(): void {
    // run the whole chart outside angular zone to improve performance
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => this.initChart(), 0);
    });
  }

  private initChart(): void {
    let width = this.hostWidth;
    let height = this.hostHeight;

    // set a default width and height
    if (width <= 0 || height <= 0) {
      width = 400;
      height = 400;
    }

    this.state.initData(this.chart);
    this.state.initChart(width, height,
      this.elementRef.nativeElement);

    this.previousWidth = width;
    this.previousHeight = height;

    this.subscribeToResize();

  }

  // function to subscribe to host resize to redraw the chart
  private subscribeToResize(): void {
    this.resizeObs = new FlResizeObservable(this.elementRef.nativeElement);

    this.resizeObs.getObs().pipe(
      debounceTime(250),
      map(() => ({x: this.hostWidth, y: this.hostHeight})),
      filter(size => size.x !== this.previousWidth || size.y !== this.previousHeight)).subscribe(
      size => this.redrawChart(size.x, size.y),
    );
  }

  // clear the svg and rebuild the chart
  private redrawChart(width: number, height: number): void {
    console.log('Redraw chart');
    this.state.chartSVG.svg.remove();
    this.state.initChart(width, height, this.elementRef.nativeElement);
  }


  private get hostWidth(): number {
    return this.elementRef.nativeElement.clientWidth;
  }

  private get hostHeight(): number {
    return this.elementRef.nativeElement.clientHeight;
  }


  private openContextMenu(mouseEvent: MouseEvent): void {
    const menu: FlMenuDynamic[] = [
      // Export to SVG button
      {
        name: 'flChart.export_chart',
        icon: 'file_download',
        onClick: () => this.state.downloadSVG()
      }];

    if (this.state.zoomBrush) {
      menu.push(
        // Reset zoom
        {
          name: 'flChart.reset_zoom',
          icon: 'search',
          onClick: () => this.state.resetZoom()
        });
    }

    if (this.contextMenuItems?.length > 0) {
      menu.push(...this.contextMenuItems);
    }

    this.menuService.openDynamicMenuFromMouseEvent(menu, mouseEvent);
  }

  ngOnDestroy(): void {
    this.resizeObs?.disconnect();
  }


}
