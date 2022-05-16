import {Component, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {Observable} from 'rxjs';
import {LabProcess} from '../../../../../lab-core/model/entities/process/lab-process.entity';
import {LabConfigureProtocolComponent} from '../lab-configure-protocol/lab-configure-protocol.component';
import {LabConfigureTaskComponent} from '../lab-configure-task/lab-configure-task.component';

/**
 * Component inside LabConfigureProtocol to configure a process.
 * If the process is a task, it calls LabConfigureTask.
 * If the process is a protocol, it calls LabConfigureProtocol (it will be recursive).
 */
@Component({
  selector: 'lab-configure-process',
  templateUrl: './lab-configure-process.component.html',
  styleUrls: ['./lab-configure-process.component.scss']
})
export class LabConfigureProcessComponent implements OnInit, OnDestroy {

  @Input() process$: Observable<LabProcess>;

  @ViewChild('viewContainer', {static: true, read: ViewContainerRef}) viewContainer: ViewContainerRef;

  constructor() {
  }

  ngOnInit(): void {
    this.process$.subscribe(
      process => this.showProcessConfig(process)
    );
  }


  private showProcessConfig(process: LabProcess): void {
    this.clearViewRef();

    if (process.isProtocol) {
      const componentRef = this.viewContainer.createComponent(LabConfigureProtocolComponent);
      componentRef.instance.protocolId = process.id;
    } else {
      const componentRef = this.viewContainer.createComponent(LabConfigureTaskComponent);
      componentRef.instance.task = process;
    }
  }

  private clearViewRef(): void {
    this.viewContainer?.clear();
  }

  ngOnDestroy(): void {
    this.clearViewRef();
  }


}
