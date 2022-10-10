import {
  Component,
  ComponentRef,
  ElementRef,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {FlThemeService} from '../../../fl-theme/fl-theme.service';
import {FlChartState} from '../../state/fl-chart.state';
import {FlMenuDynamic} from '../../../fl-menu-dynamic/model/fl-menu-dynamic.class';
import {ClHelpService} from '@monorepo/core-lib';
import {FlMenuDynamicService} from '../../../fl-menu-dynamic/fl-menu-dynamic.service';
import {FlChartConfig} from '../../model/fl-chart-config.class';
import {debounceTime, filter, map} from 'rxjs/operators';
import {FlResizeObservable} from '../../../../model/fl-resize-observable.class';
import {FlChartRightSectionDirective} from '../fl-chart-right-section/fl-chart-right-section.directive';

interface Size {
  width: number;
  height: number;
}

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

  @ViewChild('grid', {static: true}) grid: ElementRef;
  @ViewChild('chartContainer', {static: true}) chartContainer: ElementRef;

  @ViewChild('viewContainer', {static: true, read: ViewContainerRef}) viewContainer: ViewContainerRef;


  private previousWidth: number;
  private previousHeight: number;

  private resizeObs: FlResizeObservable;

  // padding in the chart container to prevent the svg to overflow
  private chartContainerPadding: number = 10;

  private legendComponentRef: ComponentRef<FlChartRightSectionDirective>;


  @HostListener('contextmenu', ['$event'])
  contextMenu(event: MouseEvent): void {
    ClHelpService.stopEventPropagation(event);
    this.openContextMenu(event);
  }

  constructor(private themeService: FlThemeService,
              private state: FlChartState,
              private menuService: FlMenuDynamicService,
              private ngZone: NgZone) {
  }

  ngOnInit(): void {
    // run the whole chart outside angular zone to improve performance
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => this.initChart(), 0);
    });
    this.renderLegend();
  }

  private initChart(): void {
    const size: Size = this.svgSize;

    // set a default width and height
    if (size.width <= 0) {
      size.width = 400;
    }
    if (size.height <= 0) {
      size.height = 400;
    }

    this.state.initData(this.chart);
    this.state.initChart(size.width, size.height,
      this.chartContainer.nativeElement);

    this.previousWidth = size.width;
    this.previousHeight = size.height;

    this.subscribeToResize();
  }

  // function to subscribe to host resize to redraw the chart
  // listen to the grid size, to prevent multi triggered because of the scrollbar
  private subscribeToResize(): void {
    this.resizeObs = new FlResizeObservable(this.grid.nativeElement);

    this.resizeObs.getObs().pipe(
      debounceTime(250),
      map(() => this.svgSize),
      filter(size => size.width !== this.previousWidth || size.height !== this.previousHeight)).subscribe(
      size => this.redrawChart(size)
    );
  }

  // clear the svg and rebuild the chart
  private redrawChart(size: Size): void {
    if (size.width <= 0 || size.height <= 0) {
      return;
    }
    console.log('Redraw chart');
    this.state.chartSVG.svg.remove();
    this.state.initChart(size.width, size.height,
      this.chartContainer.nativeElement);
  }

  private get svgSize(): Size {
    return {
      width: this.chartContainerWidth,
      height: this.chartContainerHeight - this.chartContainerPadding
    };
  }


  private get chartContainerWidth(): number {
    return this.chartContainer.nativeElement.clientWidth;
  }

  private get chartContainerHeight(): number {
    return this.chartContainer.nativeElement.clientHeight;
  }


  private openContextMenu(mouseEvent: MouseEvent): void {
    const menu: FlMenuDynamic[] = [
      // Export to SVG button
      {
        type: 'button',
        text: {text: 'flChart.export_chart', translateText: true},
        icon: 'file_download',
        onClick: () => this.state.downloadSVG()
      }];

    if (this.state.zoomBrush) {
      menu.push(
        // Reset zoom
        {
          type: 'button',
          text: {text: 'flChart.reset_zoom', translateText: true},
          icon: 'search',
          onClick: () => this.state.resetZoom()
        });
    }

    if (this.contextMenuItems?.length > 0) {
      menu.push(...this.contextMenuItems);
    }

    this.menuService.openDynamicMenuAbsolute(menu, mouseEvent);
  }

  private renderLegend(): void {
    const config = this.chart.getRightSectionConfig();

    if (config == null) return;
    this.legendComponentRef = this.viewContainer.createComponent(config.componentType);
    this.legendComponentRef.instance.data = config.data;
  }

  private destroyLegendComponentRef(): void {
    this.legendComponentRef?.destroy();
    this.legendComponentRef = null;
  }

  ngOnDestroy(): void {
    this.resizeObs?.disconnect();
    this.destroyLegendComponentRef();
    this.chart?.destroy();
  }


}
