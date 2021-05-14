import {Component, Input, OnInit} from '@angular/core';
import {FlPortalActionDetail} from '../../model/fl-portal-actions.class';
import {FlTranslateService} from '../../../fl-translate/service/fl-translate.service';
import {FlPortalActionsState} from '../../service/fl-portal-actions.state';

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

  text: string;

  constructor(private translateService: FlTranslateService,
              private actionState: FlPortalActionsState) {
  }

  ngOnInit(): void {
    // translate the text if necessary
    this.text = this.action.translateText ? this.translateService.translate(this.action.text) :
      this.action.text;

    // only subscribe if the loader is ready
    // this prevent multiple subscription
    if (this.action.status === 'ready') {
      this.subscribe();
    }
  }

  private subscribe(): void {
    console.log('Subscribe');
    this.action.status = 'loading';
    this.action.action.subscribe(
      result => this.onSuccess(result),
      error => this.onError(error)
    );
  }

  private onSuccess(result: any): void {
    this.action.status = 'success';
    this.actionState.emitResult({action: this.action, result: result, status: 'success'});
  }

  private onError(error: any): void {
    this.action.status = 'error';
    this.actionState.emitResult({action: this.action, result: error, status: 'error'});
  }

}
