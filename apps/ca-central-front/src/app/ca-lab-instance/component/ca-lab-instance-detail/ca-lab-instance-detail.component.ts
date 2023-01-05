import {Component, OnInit} from '@angular/core';
import {CaLabInstance} from '../../../ca-core/model/entities/lab/ca-lab-instance.class';
import {FlDialogService} from '@monorepo/front-core-lib';
import {
  CaLabInstanceCodelabInfoComponent
} from '../ca-lab-instance-codelab-info/ca-lab-instance-codelab-info.component';
import {CaLabInstanceDetailPageState} from '../../state/ca-lab-instance-detail-page.state';
import {Observable} from 'rxjs';

@Component({
  selector: 'ca-lab-instance-detail',
  templateUrl: './ca-lab-instance-detail.component.html',
  styleUrls: ['./ca-lab-instance-detail.component.scss']
})
export class CaLabInstanceDetailComponent implements OnInit {

  labInstance$: Observable<CaLabInstance>;
  isLoading: boolean = false;

  constructor(private state: CaLabInstanceDetailPageState,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    this.labInstance$ = this.state.getLabInstance$();
  }

  openCodelabInfo(labInstance: CaLabInstance): void {
    this.dialogService.openMediumDialog(CaLabInstanceCodelabInfoComponent, {data: labInstance});
  }

}
