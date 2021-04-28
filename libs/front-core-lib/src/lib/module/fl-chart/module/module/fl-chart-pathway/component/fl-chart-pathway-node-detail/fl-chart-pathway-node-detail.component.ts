import {Component, Input, OnInit} from '@angular/core';
import {FlChartPathwayNode} from '../../model/fl-pathway.class';

@Component({
  selector: 'fl-chart-pathway-node-detail',
  templateUrl: './fl-chart-pathway-node-detail.component.html',
  styleUrls: ['./fl-chart-pathway-node-detail.component.scss']
})
export class FlChartPathwayNodeDetailComponent implements OnInit {

  @Input() node: FlChartPathwayNode;

  constructor() {
  }

  ngOnInit(): void {
  }

}
