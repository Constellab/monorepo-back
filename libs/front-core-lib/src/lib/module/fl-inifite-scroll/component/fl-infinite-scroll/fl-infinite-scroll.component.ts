import {Component, Input, OnInit} from '@angular/core';
import {FlDatasourcePaginated} from '../../../../model/datasource/fl-datasource-paginated.class';
import {FlInfiniteScrollMode} from '../../directive/fl-infinite-scroll/fl-infinite-scroll.directive';


/**
 * Infinite scroll container that works with {@link FlDatasourcePaginated}
 * It handle the getNextPage automatically and add a button to load more result
 */
@Component({
  selector: 'fl-infinite-scroll',
  templateUrl: './fl-infinite-scroll.component.html',
  styleUrls: ['./fl-infinite-scroll.component.scss']
})
export class FlInfiniteScrollComponent implements OnInit {

  @Input() datasource: FlDatasourcePaginated<any>;

  /**
   * Distance from bottom (in pixel) when the flTrigger is called
   *
   * If 100, the event (flInfiniteScroll) will be triggered when the user reach 100 px before the
   * bottom of the container
   */
  @Input() infiniteTriggerDistance: number = 100;

  /**
   * If true check to see if the trigger distance is reach
   * on directive init.
   *
   * If the event is emitted, the value emitted is null
   */
  @Input() infiniteCheckOnInit: boolean = false;

  /**
   * If disabled, no event will be emitted
   */
  @Input() disabled: boolean = false;

  /**
   * Number of millisecond to wait after emitting an event.
   *
   * If set to 0, the debounce time is disabled
   */
  @Input() infiniteAfterDebounce: number = 500;

  /**
   * Mode for the listen
   *
   * If container, it listens to the container scroll event and check the scroll on the container
   * The fl-infinite-scroll height must be limited
   *
   * If body it listens to the windows scroll event and check the scroll on the body
   */
  @Input() infiniteMode: FlInfiniteScrollMode = 'container';

  @Input() reverseMode: boolean = false;

  @Input() textNoResult: string = 'no_result';

  @Input() textNoMoreResult: string = 'no_more_result';

  constructor() {
  }

  ngOnInit(): void {
    if (this.datasource == null) {
      console.error('[FlInfiniteScrollComponent] missing datasource');
    }
  }

  getNextPage(): void {
    this.datasource.getNextPage();
  }

  /**
   * Disabled the infinite scroll if
   * Input Disable is true
   * The datasource is loading
   * The user has reached the last page
   * The datasource status is error
   */
  get isInfiniteDisabled(): boolean {
    return this.datasource.isLoading || this.disabled
      || this.datasource.status.status === 'error' || (this.datasource?.page?.last ?? false);
  }

}
