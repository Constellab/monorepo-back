import {Component, OnInit} from '@angular/core';
import {
  FlDialogService,
  FlPaginatedTableAbstractDirective,
  FlPrettyJsonDialogComponent,
  FlPrettyJsonDialogInput
} from '@monorepo/front-core-lib';
import {BiotaData} from '../../../model/biota-data.class';

@Component({
  selector: 'gen-biota-database-table',
  templateUrl: './biota-database-table.component.html',
  styleUrls: ['./biota-database-table.component.scss']
})
export class BiotaDatabaseTableComponent extends FlPaginatedTableAbstractDirective<BiotaData>
  implements OnInit {


  constructor(private dialogService: FlDialogService) {
    super(['id', 'name']);
  }

  ngOnInit(): void {
  }

  openDetail(biotaData: BiotaData): void {
    const input: FlPrettyJsonDialogInput = {
      title: 'biota.data_detail',
      translateTitle: true,
      object: biotaData.data
    };

    this.dialogService.openMediumDialog(FlPrettyJsonDialogComponent, {data: input});
  }

}
