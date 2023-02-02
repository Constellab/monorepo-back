import {Component, OnInit} from '@angular/core';
import {UntypedFormGroup} from '@angular/forms';
import {FlSearchState, FlStatusDict} from '@monorepo/front-core-lib';
import {CaProjectStatus, caProjectStatusDict} from '../../../../model/entities/project/ca-project.class';

@Component({
  selector: 'ca-project-search-form',
  templateUrl: './ca-project-search-form.component.html',
  styleUrls: ['./ca-project-search-form.component.scss']
})
export class CaProjectSearchFormComponent implements OnInit {

  formGp: UntypedFormGroup;

  status: FlStatusDict<CaProjectStatus> = caProjectStatusDict;


  constructor(private searchState: FlSearchState<any>) {
  }

  ngOnInit(): void {
    this.formGp = this.searchState.advancedSearchFormGroup;
  }
}
