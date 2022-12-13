import {Component, OnInit} from '@angular/core';
import {UntypedFormGroup} from '@angular/forms';
import {FlSearchState} from '@monorepo/front-core-lib';
import {CaSpaceType} from '../../../../model/entities/space/ca-space.class';

@Component({
  selector: 'ca-space-search-form',
  templateUrl: './ca-space-search-form.component.html',
  styleUrls: ['./ca-space-search-form.component.scss']
})
export class CaSpaceSearchFormComponent implements OnInit {

  formGp: UntypedFormGroup;

  spaceTypes: CaSpaceType[] = ['PERSONAL', 'BASIC']

  constructor(private searchState: FlSearchState<any>) { }

  ngOnInit(): void {
    this.formGp = this.searchState.advancedSearchFormGroup;
  }

}
