import {AfterViewInit, Component, Host, OnInit, Optional} from '@angular/core';
import {FlEmbeddedOptionsAbstractDirective, FlStatus} from '@monorepo/front-core-lib';
import {MatSelect} from '@angular/material/select';
import {bioxExperimentStatusDict} from '../../../../model/entities/biox-experiment.entity';

@Component({
  selector: 'gen-biox-experiment-status-options',
  templateUrl: './biox-experiment-status-options.component.html',
  styleUrls: ['./biox-experiment-status-options.component.scss']
})
export class BioxExperimentStatusOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit {

  statusList: FlStatus[] = Object.values(bioxExperimentStatusDict);

  constructor(@Host() @Optional() public select: MatSelect) {
    super(select);
  }


  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }


}
