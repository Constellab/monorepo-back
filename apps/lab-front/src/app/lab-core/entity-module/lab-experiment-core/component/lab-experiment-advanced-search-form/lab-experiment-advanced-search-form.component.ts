import {Component, OnInit} from '@angular/core';
import {UntypedFormGroup} from '@angular/forms';
import {FlSearchState} from '@monorepo/front-core-lib';

@Component({
  selector: 'lab-experiment-advanced-search-form',
  templateUrl: './lab-experiment-advanced-search-form.component.html',
  styleUrls: ['./lab-experiment-advanced-search-form.component.scss']
})
export class LabExperimentAdvancedSearchFormComponent implements OnInit {

  formGp: UntypedFormGroup;

  constructor(private searchState: FlSearchState<any>) {
  }

  ngOnInit(): void {
    this.formGp = this.searchState.advancedSearchFormGroup;
  }

  onTagSelectionChange(): void {
    this.searchState.callAdvancedSearchFromForm();
  }

}
