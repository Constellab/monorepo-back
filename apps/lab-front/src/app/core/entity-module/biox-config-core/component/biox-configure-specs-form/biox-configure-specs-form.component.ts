import {Component, Input, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FlDynamicFormFieldConfig} from '@monorepo/front-core-lib';
import {BioxConfigData} from '../../../../model/entities/biox-config.entity';


/**
 * Use to create a form to create a configuration based on a spec {@link BioxConfigSpec}
 */
@Component({
  selector: 'gen-biox-configure-specs-form',
  templateUrl: './biox-configure-specs-form.component.html',
  styleUrls: ['./biox-configure-specs-form.component.scss']
})
export class BioxConfigureSpecsFormComponent implements OnInit {

  @Input() bioxConfigData: BioxConfigData;

  @Input() formGp: FormGroup;

  configs: FlDynamicFormFieldConfig[];

  constructor() {
  }

  ngOnInit(): void {
    this.configs = this.bioxConfigData.getDynamicFormFieldsConfig();
  }

}
