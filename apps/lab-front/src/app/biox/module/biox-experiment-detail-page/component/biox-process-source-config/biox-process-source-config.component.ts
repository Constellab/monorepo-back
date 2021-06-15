import {Component, OnInit} from '@angular/core';
import {BioxResourceSelect} from '../../../../../core/entity-module/biox-resource-core/component/biox-resource-select/biox-resource-select.component';
import {FormControl} from '@ngneat/reactive-forms';
import {BioxProcessable} from '../../../../../core/model/entities/proccesable/biox-processable.entity';
import {BioxWorkflowNodeDetailState} from '../../state/biox-workflow-node-detail.state';
import {bioxProcessSourceType} from '../../../../../core/model/entities/biox-process-special-type';

/**
 * Specific component to configure a process of type gws.plug.Source
 *
 * This allow the user to select a resource
 */
@Component({
  selector: 'gen-biox-process-source-config',
  templateUrl: './biox-process-source-config.component.html',
  styleUrls: ['./biox-process-source-config.component.scss']
})
export class BioxProcessSourceConfigComponent implements OnInit {

  formControl: FormControl<BioxResourceSelect>;

  constructor(private nodeDetail: BioxWorkflowNodeDetailState) {
  }

  ngOnInit(): void {
    this.nodeDetail.getProcess$().subscribe(
      process => this.setNode(process)
    );
  }

  private setNode(process: BioxProcessable): void {
    if (process.type !== bioxProcessSourceType) {
      console.error('[BioxProcessSourceConfigComponent] The process is not of type Source');
      return;
    }

    this.formControl = new FormControl(process.config.data.params as any);
  }

  onResourceChange(resource: BioxResourceSelect): void {
    this.nodeDetail.updateConfig(resource);
  }

}
