import {Component, Input, OnInit} from '@angular/core';
import {CaLab} from '../../../../model/entities/ca-lab.class';
import {CaLabFormDialogComponent} from '../ca-lab-form-dialog/ca-lab-form-dialog.component';
import {FlArrayObs, FlDialogService, FlFormDialogInput, FlTableAbstractDirective} from '@monorepo/front-core-lib';

@Component({
  selector: 'ca-lab-table',
  templateUrl: './ca-lab-table.component.html',
  styleUrls: ['./ca-lab-table.component.scss']
})
export class CaLabTableComponent extends FlTableAbstractDirective<CaLab> implements OnInit {

  @Input() datasource: FlArrayObs<CaLab>;

  constructor(private dialogService: FlDialogService) {
    super(['createdAt', 'lastModifiedAt', 'actions']);
  }

  ngOnInit(): void {
  }

  openUpdateLabDialog(lab: CaLab): void {
    const dialogInput: FlFormDialogInput<CaLab> = {
      mode: 'update',
      object: lab
    };

    this.dialogService.openSmallDialog(CaLabFormDialogComponent, {data: dialogInput})
      .afterClosed().subscribe(
      result => this.onUpdateDialogClosed(result)
    );
  }

  private onUpdateDialogClosed(lab?: CaLab): void {
    if (lab) {
      this.datasource.updateItem(lab);
    }
  }

}
