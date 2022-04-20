import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FlSearchState} from '@monorepo/front-core-lib';

@Component({
  selector: 'lab-view-config-search-form',
  templateUrl: './lab-view-config-search-form.component.html',
  styleUrls: ['./lab-view-config-search-form.component.scss']
})
export class LabViewConfigSearchFormComponent implements OnInit {

  formGp: FormGroup;

  constructor(private searchState: FlSearchState<any>) {
  }

  ngOnInit(): void {
    this.formGp = this.searchState.advancedSearchFormGroup;
  }
}
