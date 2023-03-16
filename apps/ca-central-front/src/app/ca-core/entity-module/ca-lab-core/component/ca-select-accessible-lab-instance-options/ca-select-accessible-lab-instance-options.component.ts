import {AfterViewInit, Component, Host, OnInit} from '@angular/core';
import {CaLabInstanceService} from '../../../../service-api/ca-lab-instance.service';
import {CaLabInstance} from '../../../../model/entities/lab/ca-lab-instance.class';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';
import {MatSelect} from '@angular/material/select';

@Component({
  selector: 'ca-select-accessible-lab-instance-options',
  templateUrl: './ca-select-accessible-lab-instance-options.component.html',
  styleUrls: ['./ca-select-accessible-lab-instance-options.component.scss']
})
export class CaSelectAccessibleLabInstanceOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit {

  labInstances: CaLabInstance[];

  constructor(private labInstanceService: CaLabInstanceService,
              @Host() private select: MatSelect) {
    super(select);
  }

  ngOnInit(): void {
    this.overrideCompareWithOnIds(this.select);
  }

  ngAfterViewInit(): void {
    this.initOptions();

    this.getAccessibleLabInstances();
  }

  private getAccessibleLabInstances(): void {
    this.labInstanceService.getCurrentRunningLabInstance().subscribe(
      labs => this.getAccessibleLabInstancesSuccess(labs)
    );
  }

  private getAccessibleLabInstancesSuccess(labInstances: CaLabInstance[]): void {
    this.labInstances = labInstances;
  }


}
