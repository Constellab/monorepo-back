import {Component, HostListener, Input, OnInit} from '@angular/core';
import {FlChartState} from '../../state/fl-chart.state';
import {FlChartMultiSerie} from '../../model/data/fl-chart-multi-serie.class';
import {ClHelpService} from '@monorepo/core-lib';
import {FlMenuDynamicService} from '../../../fl-menu-dynamic/fl-menu-dynamic.service';
import {FlMenuDynamic} from '../../../fl-menu-dynamic/model/fl-menu-dynamic.class';

@Component({
  selector: 'fl-chart-container',
  templateUrl: './fl-chart-container.component.html',
  styleUrls: ['./fl-chart-container.component.scss'],
  providers: [FlChartState]
})
export class FlChartContainerComponent implements OnInit {

  @Input() data: FlChartMultiSerie<any>;

  @HostListener('contextmenu', ['$event'])
  contextMenu(event: MouseEvent): void {
    ClHelpService.stopEventPropagation(event);
    this.openContextMenu(event);
  }

  constructor(private state: FlChartState,
              private menuService: FlMenuDynamicService) {
  }

  ngOnInit(): void {
    this.state.initData(this.data);
  }

  private openContextMenu(mouseEvent: MouseEvent): void {
    const menu: FlMenuDynamic[] = [
      // Export to SVG button
      {
        name: 'flChart.export_chart',
        icon: 'file_download',
        onClick: () => this.state.downloadSVG()
      },
      // Reset zoom
      {
        name: 'flChart.reset_zoom',
        icon: 'search',
        onClick: () => this.state.resetZoom()
      }
    ];

    this.menuService.openDynamicMenuFromMouseEvent(menu, mouseEvent);
  }

}
