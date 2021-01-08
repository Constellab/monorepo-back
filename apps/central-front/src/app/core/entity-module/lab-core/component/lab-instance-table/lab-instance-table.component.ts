import {Component, OnInit} from '@angular/core';
import {LabInstance} from '../../../../model/entities/lab-instance.class';
import {LabInstanceFormDialogComponent} from '../lab-instance-form-dialog/lab-instance-form-dialog.component';
import {FlDialogService, FlFormDialogInput, FlTableAbstractDirective} from '@monorepo/front-core-lib';


@Component({
  selector: 'gen-lab-instance-table',
  templateUrl: './lab-instance-table.component.html',
  styleUrls: ['./lab-instance-table.component.scss']
})
export class LabInstanceTableComponent extends FlTableAbstractDirective<LabInstance> implements OnInit {

  constructor(private dialogService: FlDialogService) {
    super(['lab', 'owner', 'createdBy', 'currentStatus', 'serverInfo', 'createdBy', 'actions']);
  }

  ngOnInit(): void {
  }

  openUpdateDialog(labInstance: LabInstance): void {
    const dialogInput: FlFormDialogInput<LabInstance> = {
      mode: 'update', object: labInstance
    };

    this.dialogService.openSmallDialog(LabInstanceFormDialogComponent, {data: dialogInput})
      .afterClosed().subscribe(
      result => this.onUpdateClosed(result)
    );
  }

  private onUpdateClosed(labInstance?: LabInstance): void {
    if (labInstance) {
      this.datasource.updateItem(labInstance);
    }
  }

}
