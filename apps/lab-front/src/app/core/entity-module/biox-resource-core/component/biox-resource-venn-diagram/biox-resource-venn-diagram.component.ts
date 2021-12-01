import {Component, Input, OnInit} from '@angular/core';
import {BioxResourceViewDirective} from '../../model/biox-resource-view-component.class';
import {BioxResourceVennDiagram} from '../../../../model/entities/resource/biox-resource-view.entity';
import {FlChartType, FlChartVennData} from '@monorepo/front-core-lib';

@Component({
  selector: 'gen-biox-resource-venn-diagram',
  templateUrl: './biox-resource-venn-diagram.component.html',
  styleUrls: ['./biox-resource-venn-diagram.component.scss']
})
export class BioxResourceVennDiagramComponent extends BioxResourceViewDirective<BioxResourceVennDiagram>
  implements OnInit {

  @Input() view: BioxResourceVennDiagram;

  data: FlChartVennData;

  chartType: FlChartType = FlChartType.VENN_DIAGRAM;

  ngOnInit(): void {
    this.convertToChartData();
  }

  private convertToChartData(): void {
    this.data = {
      totalNbOfGroups: this.view.data.total_number_of_groups,
      groupNames: this.view.data.group_names,
      sections: this.view.data.sections.map(section => ({groupNames: section.group_names, data: section.data}))
    };
  }

}
