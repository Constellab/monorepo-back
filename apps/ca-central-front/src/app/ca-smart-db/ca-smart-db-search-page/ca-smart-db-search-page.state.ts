import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {CaSmartDbDocSearchDatasource, CaSmartDbDocSearchResult} from '../model/ca-smart-db-doc.class';
import {CaSmartDbService} from '../../ca-core/service-api/ca-smart-db.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map} from 'rxjs/operators';
import {FlEntityPaginatedDatasource, FlQueryParamHandler} from '@monorepo/front-core-lib';
import {ClCachedObservable} from '@monorepo/core-lib';
import {CaSmartDb} from '../../ca-core/model/entities/ca-smart-db.entity';


@Injectable()
export class CaSmartDbSearchPageState implements OnDestroy {

  private smartDbId: string;
  private smartDb$: ClCachedObservable<CaSmartDb>;

  private selectedResult$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private search$: Subject<string> = new Subject();

  private datasource: CaSmartDbDocSearchDatasource;

  private queryParams: FlQueryParamHandler<{ search: string, selectedDoc: string }>;

  constructor(private smartDbService: CaSmartDbService,
              private route: ActivatedRoute,
              private router: Router) {
    this.queryParams = new FlQueryParamHandler(router, route);
  }

  public init(smartDbId: string): void {
    this.smartDb$ = new ClCachedObservable(this.smartDbService.findById(smartDbId), true);
    this.smartDbId = smartDbId;
    this.datasource = new FlEntityPaginatedDatasource(
      (page, pageSize, search: string) => this.smartDbService.search(smartDbId, search, page, pageSize),
      20, false);

    this.queryParams.getFirstQueryParams().subscribe(
      queryParam => {
        if (queryParam.search) {
          this.search(queryParam.search);
        }

        if (queryParam.selectedDoc) {
          this.selectResult(queryParam.selectedDoc);
        }
      });
  }


  public search(searchText: string): void {
    this.datasource.getFirstPage(searchText);

    // save the criteria list in the url as query params
    this.queryParams.mergeQueryParams({search: searchText});
    this.search$.next(searchText);
    this.selectResult(null);
  }

  public onNewSearch(): Observable<string> {
    return this.search$.asObservable();
  }

  public getDatasource(): CaSmartDbDocSearchDatasource {
    return this.datasource;
  }

  public getSelectedResult$(): Observable<CaSmartDbDocSearchResult | null> {
    // to retrieve the selected result, we get the ids from the selected doc
    // and search it in the data source object
    return combineLatest([
      this.datasource.connect(),
      this.selectedResult$.asObservable()]).pipe(
      map(([docs, selectedDoc]) => {
        if (docs == null || selectedDoc == null) return null;

        return docs.find(doc => doc.id === selectedDoc);
      })
    );
  }

  public selectResult(docId: string): void {
    this.selectedResult$.next(docId);

    this.queryParams.mergeQueryParams({selectedDoc: docId});
  }

  public getSmartDb$(): Observable<CaSmartDb> {
    return this.smartDb$.getObs();
  }

  ngOnDestroy(): void {
    this.datasource?.disconnect();
    this.selectedResult$.complete();
    this.search$.complete();
  }


}
