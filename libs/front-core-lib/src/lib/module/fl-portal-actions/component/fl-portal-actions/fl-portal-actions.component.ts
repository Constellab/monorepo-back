import {Component, OnInit, TrackByFunction} from '@angular/core';
import {FlPortalActionDetail} from '../../model/fl-portal-actions.class';
import {Observable} from 'rxjs';
import {FlPortalActionsState} from '../../service/fl-portal-actions.state';

/**
 * Dialog that pop at the bottom right of the screen that takes
 * an observable or multiple observable as input and subscribe to them
 * with a loader for each
 */
@Component({
  selector: 'fl-portal-actions',
  templateUrl: './fl-portal-actions.component.html',
  styleUrls: ['./fl-portal-actions.component.scss']
})
export class FlPortalActionsComponent implements OnInit {

  loaders$: Observable<FlPortalActionDetail[]>;

  constructor(private loaderState: FlPortalActionsState) {
    this.loaders$ = loaderState.getLoaders$();
  }

  ngOnInit(): void {
  }

  trackBySymbole: TrackByFunction<FlPortalActionDetail> = (index: number, item: FlPortalActionDetail) => {
    return item.symbol;
  };

}
