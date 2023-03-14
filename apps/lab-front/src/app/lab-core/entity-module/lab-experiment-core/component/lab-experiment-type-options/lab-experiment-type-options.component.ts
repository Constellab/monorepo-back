import {AfterViewInit, Component, Host, OnInit, Optional} from '@angular/core';
import {FlEmbeddedOptionsAbstractDirective, FlStatus} from '@monorepo/front-core-lib';
import {labExperimentTypeDict} from '../../../../model/entities/lab-experiment.entity';
import {MatSelect} from '@angular/material/select';

@Component({
  selector: 'lab-experiment-type-options',
  templateUrl: './lab-experiment-type-options.component.html',
  styleUrls: ['./lab-experiment-type-options.component.scss']
})
export class LabExperimentTypeOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit {

  statusList: FlStatus[] = Object.values(labExperimentTypeDict);

  constructor(@Host() @Optional() public select: MatSelect) {
    super(select);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }


}
