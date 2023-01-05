import {Component, OnInit} from '@angular/core';
import {UntypedFormGroup} from '@angular/forms';
import {FlSearchState, FlStatusDict} from '@monorepo/front-core-lib';
import {CaLabInstanceStatus, caLabInstanceStatusDict} from '../../../../model/entities/lab/ca-lab-instance.class';

@Component({
  selector: 'ca-lab-instance-search-form',
  templateUrl: './ca-lab-instance-search-form.component.html',
  styleUrls: ['./ca-lab-instance-search-form.component.scss']
})
export class CaLabInstanceSearchFormComponent implements OnInit {

  formGp: UntypedFormGroup;

  status: FlStatusDict<CaLabInstanceStatus> = caLabInstanceStatusDict;


  constructor(private searchState: FlSearchState<any>) {
  }

  ngOnInit(): void {
    this.formGp = this.searchState.advancedSearchFormGroup;
  }
}
