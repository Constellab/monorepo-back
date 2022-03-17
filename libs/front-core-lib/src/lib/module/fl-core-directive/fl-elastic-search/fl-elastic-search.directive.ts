import {Directive, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {clRxjsElasticSearch} from '@monorepo/core-lib';

/**
 * Directive to handle elastic search
 *
 * To be placed on a input
 *
 * It triggers an event after the last key pressed with an idle delay
 */
@Directive({
  selector: 'input[flElasticSearch]'
})
export class FlElasticSearchDirective implements OnInit, OnDestroy {


  /**
   * The event trigger after the idle time
   */
  @Output() flElasticSearch: EventEmitter<string> = new EventEmitter();

  /**
   * Time of idle needed to trigger the event in millisecond
   *
   * If another key is pressed before the timer end, the timer is reset
   */
  @Input() flElasticDebounceTime: number = 300;

  /**
   * The minimum input length needed to trigger the event
   *
   * If the input length is lower than the value, the event is not triggered
   */
  @Input() flElasticMinInputLength: number = 0;

  /**
   * If true the input is lowercase
   */
  @Input() flElasticLowercase: boolean = true;


  private keyUpSubject: Subject<string> = new Subject<string>();

  constructor() {
  }

  ngOnInit(): void {
    // avoid problem with input string when using flElasticSearch without value
    if (typeof this.flElasticSearch !== 'number') {
      this.flElasticDebounceTime = 300;
    }

    // subscribe to input keyup and filter value for elastic search
    this.keyUpSubject.pipe(
      clRxjsElasticSearch(this.flElasticDebounceTime, this.flElasticMinInputLength, this.flElasticLowercase)
    ).subscribe(
      value => this.triggerEvent(value)
    );
  }

  @HostListener('input', ['$event']) onInput(ev: InputEvent): void {
    this.keyUpSubject.next((ev.target as HTMLInputElement).value);
  }

  ngOnDestroy(): void {
    //  complete the subject
    this.keyUpSubject?.complete();
  }

  // emit the output event
  private triggerEvent(input: string): void {
    this.flElasticSearch.emit(input);
  }

}
