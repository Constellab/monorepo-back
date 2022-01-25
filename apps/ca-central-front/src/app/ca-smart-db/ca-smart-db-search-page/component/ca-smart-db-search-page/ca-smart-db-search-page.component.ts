import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {CaSmartDbService} from '../../../service/ca-smart-db.service';
import {CaSmartDbDocSearchDatasource, CaSmartDbDocSearchResult} from '../../../model/ca-document.class';
import {CaSmartDbSearchPageState} from '../../ca-smart-db-search-page.state';
import {Observable} from 'rxjs';
import {CaRouterService} from '../../../../ca-core/service/ca-router.service';

@Component({
  selector: 'ca-smart-db-search-page',
  templateUrl: './ca-smart-db-search-page.component.html',
  styleUrls: ['./ca-smart-db-search-page.component.scss'],
  providers: [CaSmartDbSearchPageState]
})
export class CaSmartDbSearchPageComponent implements OnInit {

  formControl: FormControl;

  datasource: CaSmartDbDocSearchDatasource;

  selectedDoc$: Observable<CaSmartDbDocSearchResult>;

  adminRoute = CaRouterService.getSmartDbAdminRoute();

  constructor(private smartDbService: CaSmartDbService,
              private state: CaSmartDbSearchPageState) {
  }

  ngOnInit(): void {
    this.formControl = new FormControl(null);

    this.state.onNewSearch().subscribe(
      search => this.formControl.patchValue(search)
    );
    this.state.init();

    this.datasource = this.state.getDatasource();
    this.selectedDoc$ = this.state.getSelectedResult$();
  }

  submit(): void {
    const value: string = this.formControl.value;
    if (value == null || value.length === 0) return;

    this.search(value);
  }

  private search(searchText: string): void {
    this.state.search(searchText);
  }
}
