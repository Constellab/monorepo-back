import {Component, OnInit, TrackByFunction} from '@angular/core';
import {FlPortalActionDetail} from '../../model/fl-portal-actions.class';
import {Observable} from 'rxjs';
import {FlPortalActionsState} from '../../service/fl-portal-actions.state';

/**
 * Portal that pop at the bottom right of the screen that takes
 * to show the current actions
 */
@Component({
  selector: 'fl-portal-actions',
  templateUrl: './fl-portal-actions.component.html',
  styleUrls: ['./fl-portal-actions.component.scss']
})
export class FlPortalActionsComponent implements OnInit {

  actions$: Observable<FlPortalActionDetail[]>;

  constructor(private actionsState: FlPortalActionsState) {
    this.actions$ = actionsState.getActions$();
  }

  ngOnInit(): void {
  }

  // track the action with symboles
  trackBySymbole: TrackByFunction<FlPortalActionDetail> = (index: number, item: FlPortalActionDetail) => {
    return item.symbol;
  };

}
