import {AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, Renderer2} from '@angular/core';
import {FlThemeService} from '../../../../service/fl-theme.service';
import {FlChartState} from '../../state/fl-chart.state';
import {FlChartMultiSerie} from '../../model/data/fl-chart-multi-serie.class';
import {FlChartType} from '../../model/fl-chart.class';
import {FlMenuDynamic} from '../../../fl-menu-dynamic/model/fl-menu-dynamic.class';
import {ClHelpService} from '@monorepo/core-lib';
import {FlMenuDynamicService} from '../../../fl-menu-dynamic/fl-menu-dynamic.service';

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
export class FlChartComponent implements OnInit, AfterViewInit {

  @Input() data: FlChartMultiSerie<any>;

  @Input() chartType: FlChartType;


  /**
   * If provided, it append the item to the context menu
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
  }

  ngAfterViewInit(): void {
    const width = this.elementRef.nativeElement.clientWidth;
    const height = this.elementRef.nativeElement.clientHeight;

    // fix the container size (because it can be altered when generating the svg)
    this.renderer.setStyle(this.elementRef.nativeElement, 'width', width + 'px');
    this.renderer.setStyle(this.elementRef.nativeElement, 'height', height+ 'px');

    this.state.initData(this.data, this.chartType);
    this.state.initChart(width, height,
      this.elementRef.nativeElement);
  }


  private openContextMenu(mouseEvent: MouseEvent): void {
    const menu: FlMenuDynamic[] = [
      // Export to SVG button
      {
        name: 'flChart.export_chart',
        icon: 'file_download',
        onClick: () => this.state.downloadSVG()
      }];

    if (this.state.zoomEnabled) {
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
