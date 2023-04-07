import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {
  LabProgressBar,
  LabProgressBarMessages,
  LabProgressMessage,
  LabProgressMessageDatasource
} from '../../../../model/entities/lab-progress-bar.entity';
import {mergeMap, Observable, Subscription} from 'rxjs';
import {map} from 'rxjs/operators';
import {LabProgressBarService} from '../../../../entity-service/lab-progress-bar.service';

/**
 * Show information about a {@link LabProgressBar}
 */
@Component({
  selector: 'lab-progress-bar-info',
  templateUrl: './lab-progress-bar-info.component.html',
  styleUrls: ['./lab-progress-bar-info.component.scss']
})
export class LabProgressBarInfoComponent implements OnInit, OnDestroy {

  @Input() progressBar$: Observable<LabProgressBar>;

  @Input() scrollableElement: HTMLElement;

  messageDatasource: LabProgressMessageDatasource;
  messages$: Observable<LabProgressMessage[]>;

  elapsedTime$: Observable<number>;

  loadMoreIsLoading = false;
  loadMoreCompleted = false;

  private subscription?: Subscription;

  private readonly nbOfMessages = 20;
  private progressBarId: string;

  trackMessageByDatetime(index: number, message: LabProgressMessage): number {
    return message.datetime.toMillis();
  }

  constructor(private progressBarService: LabProgressBarService) {

  }

  ngOnInit(): void {
    this.messageDatasource = new LabProgressMessageDatasource();
    this.messages$ = this.messageDatasource.connect();

    this.elapsedTime$ = this.progressBar$.pipe(
      map(progressBar => progressBar.elapsedTime)
    );

    // every time the progress bar updated (reload from state), refresh the message list
    this.subscription = this.progressBar$.pipe(
      mergeMap(progressBar => this.getMessages(progressBar.id))).subscribe(
      messages => this.addMessageToList(messages)
    );
  }

  private getMessages(progressBarId: string): Observable<LabProgressBarMessages> {
    this.progressBarId = progressBarId;
    // get the last 20 messages
    return this.progressBarService.getProgressBarMessages(progressBarId, this.nbOfMessages);
  }


  loadMoreMessages(): void {
    if (this.loadMoreIsLoading || this.loadMoreCompleted) return;

    this.loadMoreIsLoading = true;

    const lastMessageDatetime = this.messageDatasource.array[this.messageDatasource.array.length - 1]?.datetime;
    if (lastMessageDatetime) {
      // load message that are older than the last message in the list
      this.progressBarService.getProgressBarMessages(this.progressBarId, this.nbOfMessages, lastMessageDatetime).subscribe(
        {
          next: messages => this.loadMoreMessagesSuccess(messages),
          error: () => this.loadMoreIsLoading = false
        });
    }
  }

  private loadMoreMessagesSuccess(messages: LabProgressBarMessages): void {
    this.loadMoreIsLoading = false;
    this.addMessageToList(messages);

  }

  // add message to the list, avoid duplicate and respect order
  private addMessageToList(messages: LabProgressBarMessages): void {
    this.messageDatasource.removeItem(messages.messages);
    this.messageDatasource.addItem(messages.messages, (a, b) => a.datetime > b.datetime);

    // if the number of messages is less than the number of messages requested, it means that there is no more messages
    if (messages.messages.length < this.nbOfMessages) {
      this.loadMoreCompleted = true;
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.messageDatasource.disconnect();
  }

}
