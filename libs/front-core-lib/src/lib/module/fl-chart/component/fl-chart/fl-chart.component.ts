import {Component, ElementRef, HostListener, Input, OnInit, Renderer2} from '@angular/core';
import {FlThemeService} from '../../../../service/fl-theme.service';
import {FlChartState} from '../../state/fl-chart.state';
import {FlMenuDynamic} from '../../../fl-menu-dynamic/model/fl-menu-dynamic.class';
import {ClHelpService} from '@monorepo/core-lib';
import {FlMenuDynamicService} from '../../../fl-menu-dynamic/fl-menu-dynamic.service';
import {FlChartConfig2} from '../../model/fl-chart-config.class';

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
export class FlChartComponent implements OnInit {


  @Input() chart: FlChartConfig2;


  /**
   * If provided, it appends the item to the context menu
   */
  @Input() contextMenuItems: FlMenuDynamic[];

  // @ViewChild('chart', {static: true}) chartHtmlContainer: ElementRef<HTMLElement>;

  @HostListener('contextmenu', ['$event'])
  contextMenu(event: MouseEvent): void {
    ClHelpService.stopEventPropagation(event);
    this.openContextMenu(event);
  }

  constructor(private themeService: FlThemeService,
              private state: FlChartState,
              private menuService: FlMenuDynamicService,
              private elementRef: ElementRef<HTMLElement>,
              private renderer: Renderer2) {
  }

  ngOnInit(): void {
    setTimeout(() => this.initChart(), 0);
  }

  private initChart(): void {
    let width = this.elementRef.nativeElement.clientWidth;
    let height = this.elementRef.nativeElement.clientHeight;

    // set a default width and height
    if (width <= 0 || height <= 0) {
      width = 400;
      height = 400;
    }

    this.state.initData(this.chart);
    this.state.initChart(width, height,
      this.elementRef.nativeElement);

    // fix the container size (because it can be altered when generating the svg) the same size as the SVG
    this.renderer.setStyle(this.elementRef.nativeElement, 'width', this.state.chartSVG.width + 'px');
    this.renderer.setStyle(this.elementRef.nativeElement, 'height', this.state.chartSVG.height + 'px');

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
}
