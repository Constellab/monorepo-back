import {Component, Input, OnInit} from '@angular/core';
import {UntypedFormGroup} from '@angular/forms';
import {FlSearchState, FlStatusDict} from '@monorepo/front-core-lib';
import {CaLabInstanceStatus, caLabInstanceStatusDict} from '../../../../model/entities/lab/ca-lab-instance.class';
import {
  CaSelectUserMode
} from '../../../ca-user-core/component/ca-select-user-options/ca-select-user-options.component';

export type CaLabInstanceSearchMode = 'all' | 'current-space';

@Component({
  selector: 'ca-lab-instance-search-form',
  templateUrl: './ca-lab-instance-search-form.component.html',
  styleUrls: ['./ca-lab-instance-search-form.component.scss']
})
export class CaLabInstanceSearchFormComponent implements OnInit {

  @Input() mode: CaLabInstanceSearchMode;

  formGp: UntypedFormGroup;

  status: FlStatusDict<CaLabInstanceStatus> = caLabInstanceStatusDict;

  selectUserMode: CaSelectUserMode;


  constructor(private searchState: FlSearchState<any>) {
  }

  ngOnInit(): void {
    this.formGp = this.searchState.advancedSearchFormGroup;
    this.selectUserMode = this.mode === 'all' ? 'all' : 'space';
  }
}
