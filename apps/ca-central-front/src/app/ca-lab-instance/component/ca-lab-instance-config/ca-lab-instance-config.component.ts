import {Component, Input, OnInit} from '@angular/core';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';
import {Observable} from 'rxjs';
import {CaLabInstanceConfig} from '../../../ca-core/model/entities/ca-lab-manager.class';

/**
 * Component to configure the lab instance (bricks)
 */
@Component({
  selector: 'ca-lab-instance-config',
  templateUrl: './ca-lab-instance-config.component.html',
  styleUrls: ['./ca-lab-instance-config.component.scss']
})
export class CaLabInstanceConfigComponent implements OnInit {

  @Input() labInstanceId: string;

  labConfig$: Observable<CaLabInstanceConfig>;

  constructor(private labInstanceService: CaLabInstanceService) {
  }

  ngOnInit(): void {
    this.labConfig$ = this.labInstanceService.getConfig(this.labInstanceId);
  }

}
