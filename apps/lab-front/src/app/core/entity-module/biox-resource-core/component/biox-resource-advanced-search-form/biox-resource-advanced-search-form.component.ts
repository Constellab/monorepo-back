import {Component, OnInit} from '@angular/core';
import {FlFormInputsManagerConfig, FlSearchState} from '@monorepo/front-core-lib';
import {BioxResource} from '../../../../model/entities/resource/biox-resource.entity';
import {FormGroup} from '@ngneat/reactive-forms';
import {BioxResourceSearch} from '../../model/biox-resource-advanced-search.class';

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

  formInputConfig: FlFormInputsManagerConfig = BioxResourceSearch.advancedSearchManagerConfig;

  constructor(private searchState: FlSearchState<BioxResource>) {
  }

  ngOnInit(): void {
    this.formGp = this.searchState.advancedSearchFormGroup;
  }

  submit(): void {
    if (this.formGp.valid) {
      this.searchState.callAdvancedSearchFromForm();
    }
  }

}
