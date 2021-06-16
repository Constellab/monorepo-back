import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {FlPathwayDrawerAction} from '../../model/fl-pathway-drawer-action.class';
import {Observable} from 'rxjs';
import {FlPathwayDrawerState} from '../../state/fl-pathway-drawer.state';

@Component({
  selector: 'fl-pathway-drawer-action',
  templateUrl: './fl-pathway-drawer-action.component.html',
  styleUrls: ['./fl-pathway-drawer-action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlPathwayDrawerActionComponent implements OnInit {

  action$: Observable<FlPathwayDrawerAction>;

  constructor(private drawerState: FlPathwayDrawerState) {
  }

  ngOnInit(): void {
    this.action$ = this.drawerState.getAction$();
  }

}
