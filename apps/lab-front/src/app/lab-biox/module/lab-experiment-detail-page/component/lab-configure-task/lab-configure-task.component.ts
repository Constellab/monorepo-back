import {Component, Input, OnInit} from '@angular/core';
import {LabProcess} from '../../../../../lab-core/model/entities/process/lab-process.entity';
import {UntypedFormGroup} from '@angular/forms';
import {LabConfigureSpecsForm} from '../../../../../lab-core/model/entities/lab-config.entity';
import {
  LabConfigureSpecsFormComponent
} from '../../../../../lab-core/entity-module/lab-config-core/component/lab-configure-specs-form/lab-configure-specs-form.component';
import {LabExperimentDetailPageState} from '../../state/lab-experiment-detail-page.state';

@Component({
  selector: 'lab-configure-task',
  templateUrl: './lab-configure-task.component.html',
  styleUrls: ['./lab-configure-task.component.scss']
})
export class LabConfigureTaskComponent implements OnInit {

  @Input() task: LabProcess;

  formGp: UntypedFormGroup = new UntypedFormGroup({});


  constructor(private experimentState: LabExperimentDetailPageState) {
  }

  ngOnInit(): void {
    this.formGp = LabConfigureSpecsFormComponent.buildFormGroup(this.task.config.data);
  }

  submit(): void {
    if (this.formGp.valid) {
      this.saveConfig(this.formGp.getRawValue());
    }
  }

  private saveConfig(config: LabConfigureSpecsForm): void {
    const configValue = {...config.public, ...config.protected};
    this.experimentState.updateProcessConfig(this.task.parentProtocolId, this.task.name, configValue);
  }

}
