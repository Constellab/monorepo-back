import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {CaLabInstance} from '../../../ca-core/model/entities/lab/ca-lab-instance.class';
import {CaLabInstanceDetailPageState} from '../../state/ca-lab-instance-detail-page.state';

@Component({
  selector: 'ca-lab-instance-dashboard-page',
  templateUrl: './ca-lab-instance-dashboard-page.component.html',
  styleUrls: ['./ca-lab-instance-dashboard-page.component.scss']
})
export class CaLabInstanceDashboardPageComponent implements OnInit {

  labInstance$: Observable<CaLabInstance> = this.state.getLabInstance$();

  constructor(private state: CaLabInstanceDetailPageState) {
  }

  ngOnInit(): void {
  }

}
