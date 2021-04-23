import {Component, Input, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FlDynamicFormFieldConfig} from '@monorepo/front-core-lib';
import {BioxConfigSpecs} from '../../../../model/entities/biox-config-spec.entity';


/**
 * Use to create a form to create a configuration based on a spec {@link BioxConfigSpec}
 */
@Component({
  selector: 'gen-biox-configure-specs',
  templateUrl: './biox-configure-specs.component.html',
  styleUrls: ['./biox-configure-specs.component.scss']
})
export class BioxConfigureSpecsComponent implements OnInit {

  @Input() specs: BioxConfigSpecs;

  @Input() currentConfig: any;

  @Input() formGp: FormGroup;

  configs: FlDynamicFormFieldConfig[];

  constructor() {
  }

  ngOnInit(): void {
    this.configs = this.specs.convertToFieldConfigs(this.currentConfig);
  }

}
