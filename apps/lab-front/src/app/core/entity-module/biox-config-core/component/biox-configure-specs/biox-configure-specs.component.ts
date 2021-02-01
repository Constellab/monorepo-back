import {Component, Input, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {BioxConfigSpecs, convertBioxConfigSpecToFieldConfig} from '../../../../model/entities/biox-config.entity';
import {FlDynamicFormFieldConfig} from '@monorepo/front-core-lib';


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

  @Input() formGp: FormGroup;

  configs: FlDynamicFormFieldConfig[];

  constructor() {
  }

  ngOnInit(): void {
    this.initConfigs();
  }

  private initConfigs(): void {
    this.configs = [];
    for (const spec of Object.keys(this.specs)) {
      this.configs.push(convertBioxConfigSpecToFieldConfig(this.specs[spec], spec));
    }
  }
}
