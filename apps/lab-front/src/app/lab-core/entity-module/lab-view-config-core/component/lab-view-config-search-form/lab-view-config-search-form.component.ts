import {Component, Input, OnInit} from '@angular/core';
import {FlSearchState} from '@monorepo/front-core-lib';
import {FormGroup} from '@ngneat/reactive-forms';

@Component({
  selector: 'lab-view-config-search-form',
  templateUrl: './lab-view-config-search-form.component.html',
  styleUrls: ['./lab-view-config-search-form.component.scss']
})
export class LabViewConfigSearchFormComponent implements OnInit {

  @Input() showProjectFilter: boolean = true;

  formGp: FormGroup;

  constructor(private searchState: FlSearchState<any>) {
  }

  ngOnInit(): void {
    this.formGp = this.searchState.advancedSearchFormGroup;
  }

  callSearch(): void {
    this.searchState.callAdvancedSearchFromForm();
  }

}
