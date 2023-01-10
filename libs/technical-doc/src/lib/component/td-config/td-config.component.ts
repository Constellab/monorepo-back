import {Component, Input, OnInit} from '@angular/core';
import {TdParamSpec, TdParamSpecParamSet} from '../../model/td-config-spec.class';

@Component({
  selector: 'td-config',
  templateUrl: './td-config.component.html',
  styleUrls: ['./td-config.component.scss']
})
export class TdConfigComponent implements OnInit {

  @Input() configSpecs?: Record<string, TdParamSpec>;

  constructor() {
  }

  ngOnInit(): void {

  }

  public getParamSet(confSpec: TdParamSpec): Record<string, TdParamSpec> {
    return (confSpec as TdParamSpecParamSet).additional_info.param_set;
  }

  public getMaxParamSetOccurrences(confSpec: TdParamSpec): number {
    return (confSpec as TdParamSpecParamSet).additional_info.max_number_of_occurrences;
  }

}
