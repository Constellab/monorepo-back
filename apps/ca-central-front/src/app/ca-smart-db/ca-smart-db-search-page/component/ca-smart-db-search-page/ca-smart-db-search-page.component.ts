import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {CaSmartDbService} from '../../../../ca-core/service-api/ca-smart-db.service';
import {CaSmartDbDocSearchDatasource, CaSmartDbDocSearchResult} from '../../../model/ca-smart-db-doc.class';
import {CaSmartDbSearchPageState} from '../../ca-smart-db-search-page.state';
import {Observable} from 'rxjs';
import {CaRouterService} from '../../../../ca-core/service/ca-router.service';
import {ActivatedRoute} from '@angular/router';
import {CaSmartDb} from '../../../../ca-core/model/entities/ca-smart-db.entity';

@Component({
  selector: 'ca-smart-db-search-page',
  templateUrl: './ca-smart-db-search-page.component.html',
  styleUrls: ['./ca-smart-db-search-page.component.scss'],
  providers: [CaSmartDbSearchPageState]
})
export class CaSmartDbSearchPageComponent implements OnInit {

  smartDbId: string;
  smartDb$: Observable<CaSmartDb>;

  formControl: FormControl;

  datasource: CaSmartDbDocSearchDatasource;

  selectedDoc$: Observable<CaSmartDbDocSearchResult>;

  adminRoute: string;

  constructor(private route: ActivatedRoute,
              private smartDbService: CaSmartDbService,
              private state: CaSmartDbSearchPageState) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => this.init(params.smartDbId)
    );
  }

  private init(smartDbId: string): void {
    this.smartDbId = smartDbId;
    this.adminRoute = CaRouterService.getSmartDbAdminRoute(smartDbId);
    this.formControl = new FormControl(null);

    this.state.onNewSearch().subscribe(
      search => this.formControl.patchValue(search)
    );
    this.state.init(smartDbId);

    this.smartDb$ = this.state.getSmartDb$();
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
