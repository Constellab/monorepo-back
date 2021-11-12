import {Component, OnDestroy, OnInit} from '@angular/core';
import {BioxResourceSelect} from '../../../../../core/entity-module/biox-resource-core/component/biox-resource-select/biox-resource-select.component';
import {FormControl} from '@ngneat/reactive-forms';
import {BioxProcess} from '../../../../../core/model/entities/process/biox-process.entity';
import {BioxWorkflowNodeDetailState} from '../../state/biox-workflow-node-detail.state';
import {Subscription} from 'rxjs';

/**
 * Specific component to configure a task of type gws.plug.Source
 *
 * This allow the user to select a resource
 */
@Component({
  selector: 'gen-biox-task-source-config',
  templateUrl: './biox-task-source-config.component.html',
  styleUrls: ['./biox-task-source-config.component.scss']
})
export class BioxTaskSourceConfigComponent implements OnInit, OnDestroy {

  formControl: FormControl<BioxResourceSelect>;

  private subscription: Subscription;

  constructor(private nodeDetail: BioxWorkflowNodeDetailState) {
  }

  ngOnInit(): void {
    this.subscription = this.nodeDetail.getProcess$().subscribe(
      process => this.setNode(process)
    );
  }

  private setNode(process: BioxProcess): void {
    if (!process.isSource()) {
      return;
    }

    this.formControl = new FormControl(process.config.data.values as any);
  }

  onResourceChange(resource: BioxResourceSelect): void {
    this.nodeDetail.updateConfig(resource);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }


}
