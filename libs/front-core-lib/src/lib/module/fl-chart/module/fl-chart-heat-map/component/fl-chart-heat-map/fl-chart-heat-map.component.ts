import {Component, OnInit} from '@angular/core';
import {HeatMapData} from '../../../../model/data';

@Component({
  selector: 'fl-chart-heat-map',
  templateUrl: './fl-chart-heat-map.component.html',
  styleUrls: ['./fl-chart-heat-map.component.scss']
})
export class FlChartHeatMapComponent implements OnInit {

  constructor() {
  }

  ngOnInit(): void {
    // this.initChart(getHeatMapData());
  }

  private initChart(data: HeatMapData[]): void {
//     const dataContainer: FlChart2dDataContainer<HeatMapData> = new FlChart2dData(data);
//
//     const chart: FlChart2d<any> = new FlChartHeatMap()
//
//     // Labels of row and columns
//     const myGroups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
//     const myVars = ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9', 'v10']
//
// // Build X scales and axis:
//     const x = d3.scaleBand()
//       .range([ 0, width ])
//       .domain(myGroups)
//       .padding(0.01);
//
//
// // Build X scales and axis:
//     const y = d3.scaleBand()
//       .range([ height, 0 ])
//       .domain(myVars)
//       .padding(0.01);
//
//
//     const chart: FlChart2dHistogram<any> = new FlChart2dHistogram<any>(450, 450);
  }

}
