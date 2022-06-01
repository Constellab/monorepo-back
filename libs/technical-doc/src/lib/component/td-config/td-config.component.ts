import {Component, Input, OnInit} from '@angular/core';
import {TdConfigSpec, TdConfigSpecParamSet} from '../../model/td-process-type.entity';

@Component({
  selector: 'td-config',
  templateUrl: './td-config.component.html',
  styleUrls: ['./td-config.component.scss']
})
export class TdConfigComponent implements OnInit {

  @Input()
  configSpecs?: Record<string, TdConfigSpec>;

  constructor() {
  }

  ngOnInit(): void {

  }

  public getParamSet(confSpec: TdConfigSpec): Record<string, TdConfigSpec>{
    return (confSpec as TdConfigSpecParamSet).param_set;
  }

  public getMaxParamSetOccurrences(confSpec: TdConfigSpec): number{
    return (confSpec as TdConfigSpecParamSet).max_number_of_occurrences;
  }

}
