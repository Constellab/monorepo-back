import {Component, OnInit} from '@angular/core';
import {CaLabInstance} from '../../../ca-core/model/entities/lab/ca-lab-instance.class';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';
import {ActivatedRoute} from '@angular/router';
import {CaLabInstanceDetailPageState} from '../../state/ca-lab-instance-detail-page.state';
import {Observable} from 'rxjs';
import {CaLabInstanceDetailServerState} from '../../state/ca-lab-instance-detail-server.state';
import {CaLabInstanceDetailManagerState} from '../../state/ca-lab-instance-detail-manager.state';

@Component({
  selector: 'ca-lab-instance-detail-page',
  templateUrl: './ca-lab-instance-detail-page.component.html',
  styleUrls: ['./ca-lab-instance-detail-page.component.scss'],
  providers: [CaLabInstanceDetailPageState,
    CaLabInstanceDetailServerState, CaLabInstanceDetailManagerState]
})
export class CaLabInstanceDetailPageComponent implements OnInit {

  labInstance$: Observable<CaLabInstance>;
  isOwner$: Observable<boolean>;

  isLoading: boolean = false;

  constructor(private state: CaLabInstanceDetailPageState,
              private labInstanceService: CaLabInstanceService,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => this.getLabInstance(params.id)
    );
  }

  private getLabInstance(id: string): void {
    this.isLoading = true;
    this.state.init(id);
    this.labInstance$ = this.state.getLabInstance$();
    this.isOwner$ = this.state.isLabOwner$();
  }
}
