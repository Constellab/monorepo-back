import {Component, Input, OnInit} from '@angular/core';
import {BioxConfig} from '../../../../../core/model/entities/biox-config.entity';

/**
 * Show the config current values as json
 */
@Component({
  selector: 'gen-biox-workflow-node-config',
  templateUrl: './biox-workflow-node-config.component.html',
  styleUrls: ['./biox-workflow-node-config.component.scss']
})
export class BioxWorkflowNodeConfigComponent implements OnInit {

  @Input() config: BioxConfig;

  constructor() { }

  ngOnInit(): void {
  }

  get configValue(): any{
    return this.config.data.mergeConfigWithDefault()
  }

}
