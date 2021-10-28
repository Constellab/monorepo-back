import {Component, Input, OnInit} from '@angular/core';
import {FlPortalActionDetail, FlPortalActionStatus} from '../../model/fl-portal-actions.class';
import {FlTranslateService} from '../../../fl-translate/service/fl-translate.service';
import {Observable} from 'rxjs';

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

  status$: Observable<FlPortalActionStatus>;

  text: string;

  constructor(private translateService: FlTranslateService) {
  }

  ngOnInit(): void {
    // translate the text if necessary
    this.text = this.translateService.translatableText(this.action.text);
    this.status$ = this.action.getStatus$();
  }

}
