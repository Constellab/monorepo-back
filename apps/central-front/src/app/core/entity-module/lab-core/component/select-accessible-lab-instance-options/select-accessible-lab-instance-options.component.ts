import {AfterViewInit, Component, Host, OnInit} from '@angular/core';
import {LabInstanceService} from '../../../../service-api/lab-instance.service';
import {MatSelect} from '@angular/material/select';
import {EmbeddedOptionsAbstractDirective} from '../../../../abstract-directive/embedded-options-abstract.directive';
import {LabInstance} from '../../../../model/entities/lab-instance.class';

@Component({
  selector: 'gen-select-accessible-lab-instance-options',
  templateUrl: './select-accessible-lab-instance-options.component.html',
  styleUrls: ['./select-accessible-lab-instance-options.component.scss']
})
export class SelectAccessibleLabInstanceOptionsComponent extends EmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit {

  labInstances: LabInstance[];

  constructor(private labInstanceService: LabInstanceService,
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

  private getAccessibleLabInstancesSuccess(labInstances: LabInstance[]): void {
    this.labInstances = labInstances;
  }


}
