import {Component, Inject, OnInit} from '@angular/core';
import {FL_PORTAL_DATA} from '../../../../fl-portal/model/fl-portal.class';
import {FlChartVennDataSection} from '../../../model/data/fl-chart-venn-data.class';

/**
 * Simple portal to display the venn data on a section
 */
@Component({
  selector: 'fl-chart-venn-data-portal',
  templateUrl: './fl-chart-venn-data-portal.component.html',
  styleUrls: ['./fl-chart-venn-data-portal.component.scss']
})
export class FlChartVennDataPortalComponent implements OnInit {


  groupNames: string;
  dataLength: number;

  dataStr: string;

  constructor(@Inject(FL_PORTAL_DATA) section: FlChartVennDataSection) {
    this.groupNames = section.groupNames.join(', ');
    this.dataLength = section.data?.length ?? 0;
    this.dataStr = section.data.join(', ');
  }

  ngOnInit(): void {
  }

}
