import {Component, OnInit} from '@angular/core';
import {CaLabInstanceDetailPageState} from '../../state/ca-lab-instance-detail-page.state';
import {Observable} from 'rxjs';

/**
 * Sub-page of lab instance to configure the lab instance server, bricks, backup, etc.
 */
@Component({
  selector: 'ca-lab-instance-config-page',
  templateUrl: './ca-lab-instance-config-page.component.html',
  styleUrls: ['./ca-lab-instance-config-page.component.scss']
})
export class CaLabInstanceConfigPageComponent implements OnInit {

  isOwner$: Observable<boolean> = this.state.isLabOwner$();

  isCloud$: Observable<boolean> = this.state.isCloud$();

  constructor(private state: CaLabInstanceDetailPageState) {
  }

  ngOnInit(): void {
  }

}
