import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {CaSmartDbDoc, CaSmartDbDocDatasource} from '../model/ca-document.class';
import {CaSmartDbService} from '../service/ca-smart-db.service';
import {ActivatedRoute, Router} from '@angular/router';
import {first} from 'rxjs/operators';


@Injectable()
export class CaSmartDbSearchPageState implements OnDestroy {

  private selectedResult$: BehaviorSubject<CaSmartDbDoc> = new BehaviorSubject<CaSmartDbDoc>(null);
  private search$: Subject<string> = new Subject();

  private datasource: CaSmartDbDocDatasource;

  constructor(private smartDbService: CaSmartDbService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  public init(): void {
    this.datasource = new CaSmartDbDocDatasource((page, pageSize, search: string) => this.smartDbService.search(search, page, pageSize));

    this.route.queryParams.pipe(first()).subscribe(
      queryParam => {
        if (queryParam.search) {
          this.search(queryParam.search);
        }
      });
  }


  public search(searchText: string): void {
    this.datasource.getFirstPage(searchText);

    // save the criteria list in the url as query params
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {search: searchText},
      replaceUrl: true
    });
    this.search$.next(searchText);
  }

  public onNewSearch(): Observable<string> {
    return this.search$.asObservable();
  }

  public getDatasource(): CaSmartDbDocDatasource {
    return this.datasource;
  }

  public getSelectedResult$(): Observable<CaSmartDbDoc> {
    return this.selectedResult$.asObservable();
  }

  public selectResult(result: CaSmartDbDoc): void {
    this.selectedResult$.next(result);
  }

  ngOnDestroy(): void {
    this.datasource?.disconnect();
    this.selectedResult$.complete();
    this.search$.complete();
  }


}
