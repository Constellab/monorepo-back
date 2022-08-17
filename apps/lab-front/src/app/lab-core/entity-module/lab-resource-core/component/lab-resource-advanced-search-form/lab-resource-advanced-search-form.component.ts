import {Component, OnInit} from '@angular/core';
import {UntypedFormGroup} from '@angular/forms';
import {FlSearchState} from '@monorepo/front-core-lib';

/**
 * Work within the lab-resource-search and this manage the advanced search form
 */
@Component({
  selector: 'lab-resource-advanced-search-form',
  templateUrl: './lab-resource-advanced-search-form.component.html',
  styleUrls: ['./lab-resource-advanced-search-form.component.scss']
})
export class LabResourceAdvancedSearchFormComponent implements OnInit {

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
