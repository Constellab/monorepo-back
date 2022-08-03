import {Injectable, NgZone, OnDestroy} from '@angular/core';
import {FlSpreadsheetPage, FlSpreadsheetPageLoader} from '../model/fl-spreadsheet-page.class';
import {FlSpreadsheetState} from './fl-spreadsheet.state';
import {Subscription} from 'rxjs';
import {FlPortalActionsService} from '../../fl-portal-actions/service/fl-portal-actions.service';
import {FlPortalActionResult} from '../../fl-portal-actions/model/fl-portal-actions.class';


@Injectable()
export class FlSpreadsheetPaginationState implements OnDestroy {

  private static id: number = 0;

  private pagination: FlSpreadsheetPageLoader;

  private nextPageIsLoading: boolean = false;
  private previousPageIsLoading: boolean = false;

  private nextPageSubscription: Subscription;
  private previousPageSubscription: Subscription;
  private readonly id: number;

  constructor(private state: FlSpreadsheetState,
              private actionService: FlPortalActionsService,
              private ngZone: NgZone) {
    this.id = FlSpreadsheetPaginationState.id++;
  }

  public init(pagination: FlSpreadsheetPageLoader): void {
    this.pagination = pagination;
    this.nextPageSubscription = this.actionService.getResult$(this.getNextPageAction()).subscribe(
      (data: FlPortalActionResult) => this.onNextPage(data)
    );

    this.previousPageSubscription = this.actionService.getResult$(this.getPreviousPageAction()).subscribe(
      (data: FlPortalActionResult) => this.onPreviousPage(data)
    );
  }

  public callNextPage(): void {
    if (this.pagination == null || this.nextPageIsLoading) return;

    const sheet = this.state.currentSheet;

    if (!(sheet.hasNextRowsPage())) return;

    this.nextPageIsLoading = true;

    // + 1 because we want to start from the next line of the last line
    const fromRow = sheet.getLastRowsOffsetIndex() + 1;
    this.ngZone.run(() => {
      this.actionService.addAction({
        type: this.getNextPageAction(),
        action: this.pagination.loadRows(fromRow),
        text: {text: 'flSpreadsheet.loading_next_rows', translateText: true},
        additionalInformation: sheet.id
      }, true);
    });
  }

  public callPreviousPage(): void {
    if (this.pagination == null || this.previousPageIsLoading) return;

    const sheet = this.state.currentSheet;

    if (!(sheet.hasPreviousRowsPage())) return;

    this.previousPageIsLoading = true;
    // - 1 because we want to start from the previous line of the first line (offset)
    const toRow = sheet.getFirstRowsOffsetIndex();
    this.ngZone.run(() => {
      this.actionService.addAction({
        type: this.getPreviousPageAction(),
        action: this.pagination.loadPreviousRows(toRow),
        text: {text: 'flSpreadsheet.loading_previous_rows', translateText: true},
        additionalInformation: sheet.id
      }, true);
    });
  }

  private onNextPage(actionResult: FlPortalActionResult<FlSpreadsheetPage>): void {
    this.nextPageIsLoading = false;

    if (actionResult.status === 'success') {
      const sheet = this.state.getSheet(actionResult.additionalInformation);
      sheet.appendLazyLoadedNextRows(actionResult.result.data, actionResult.result.rows);
    }
  }

  private onPreviousPage(actionResult: FlPortalActionResult<FlSpreadsheetPage>): void {
    this.previousPageIsLoading = false;

    if (actionResult.status === 'success') {
      const sheet = this.state.getSheet(actionResult.additionalInformation);
      sheet.insertLazyLoadedPreviousRows(actionResult.result.data, actionResult.result.rows);
    }
  }

  private getNextPageAction(): string {
    return `fl-load-next-page-${this.id}`;
  }

  private getPreviousPageAction(): string {
    return `fl-load-previous-page-${this.id}`;
  }

  ngOnDestroy(): void {
    this.nextPageSubscription?.unsubscribe();
    this.previousPageSubscription?.unsubscribe();
  }
}

