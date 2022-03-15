import {Component, Input, OnInit} from '@angular/core';
import {FlPortalActionDetail, FlPortalActionDetailStatusEvent} from '../../model/fl-portal-actions.class';
import {FlTranslateService} from '../../../fl-translate/service/fl-translate.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

/**
 * Component inside {@link FlPortalActionsComponent} that subscribe
 * and show loader for one observable
 */
@Component({
  selector: 'fl-portal-action-line',
  templateUrl: './fl-portal-action-line.component.html',
  styleUrls: ['./fl-portal-action-line.component.scss']
})
export class FlPortalActionLineComponent implements OnInit {

  @Input() action: FlPortalActionDetail;

  statusEvent$: Observable<FlPortalActionDetailStatusEvent>;
  link$: Observable<string | null>;

  text: string;

  constructor(private translateService: FlTranslateService) {
  }

  ngOnInit(): void {
    // translate the text if necessary
    this.text = this.translateService.translatableText(this.action.text);
    this.statusEvent$ = this.action.getStatusEvent$();
    this.link$ = this.action.getResult$().pipe(map(result => result.status === 'success' ? result.link : null));
  }

}
