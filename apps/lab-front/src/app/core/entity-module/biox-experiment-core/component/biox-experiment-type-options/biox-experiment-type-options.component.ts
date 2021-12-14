import {AfterViewInit, Component, Host, OnInit, Optional} from '@angular/core';
import {FlEmbeddedOptionsAbstractDirective, FlStatus} from '@monorepo/front-core-lib';
import {MatSelect} from '@angular/material/select';
import {bioxExperimentTypeDict} from '../../../../model/entities/biox-experiment.entity';

@Component({
  selector: 'gen-biox-experiment-type-options',
  templateUrl: './biox-experiment-type-options.component.html',
  styleUrls: ['./biox-experiment-type-options.component.scss']
})
export class BioxExperimentTypeOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit {

  statusList: FlStatus[] = Object.values(bioxExperimentTypeDict);

  constructor(@Host() @Optional() public select: MatSelect) {
    super(select);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }


}
