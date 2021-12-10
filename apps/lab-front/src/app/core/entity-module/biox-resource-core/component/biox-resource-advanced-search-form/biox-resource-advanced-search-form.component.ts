import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FlSearchState} from '@monorepo/front-core-lib';

/**
 * Work within the biox-resource-search and this manage the advanced search form
 */
@Component({
  selector: 'gen-biox-resource-advanced-search-form',
  templateUrl: './biox-resource-advanced-search-form.component.html',
  styleUrls: ['./biox-resource-advanced-search-form.component.scss']
})
export class BioxResourceAdvancedSearchFormComponent implements OnInit {

  formGp: FormGroup;

  constructor(private searchState: FlSearchState<any>) {
  }

  ngOnInit(): void {
    this.formGp = this.searchState.advancedSearchFormGroup;
  }


}
