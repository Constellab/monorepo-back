import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {CaSmartDbDoc, CaSmartDbDocDatasource} from '../model/ca-document.class';
import {CaSmartDbService} from '../service/ca-smart-db.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map} from 'rxjs/operators';
import {FlEntityPaginatedDatasource, FlQueryParamHandler} from '@monorepo/front-core-lib';


@Injectable()
export class CaSmartDbSearchPageState implements OnDestroy {

  private selectedResult$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private search$: Subject<string> = new Subject();

  private datasource: CaSmartDbDocDatasource;

  private queryParams: FlQueryParamHandler<{ search: string, selectedDoc: string }>;

  constructor(private smartDbService: CaSmartDbService,
              private route: ActivatedRoute,
              private router: Router) {
    this.queryParams = new FlQueryParamHandler(router, route);
  }

  public init(): void {
    this.datasource = new FlEntityPaginatedDatasource(
      (page, pageSize, search: string) => this.smartDbService.search(search, page, pageSize),
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

  public getDatasource(): CaSmartDbDocDatasource {
    return this.datasource;
  }

  public getSelectedResult$(): Observable<CaSmartDbDoc | null> {
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

    setTimeout(() => {
      this.queryParams.mergeQueryParams({selectedDoc: docId});
    });
  }

  ngOnDestroy(): void {
    this.datasource?.disconnect();
    this.selectedResult$.complete();
    this.search$.complete();
  }


}
