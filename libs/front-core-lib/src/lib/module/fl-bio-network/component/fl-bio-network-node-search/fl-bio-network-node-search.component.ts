import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FlBioNetworkState} from '../../state/fl-bio-network.state';
import {filter, Observable} from 'rxjs';
import {FlBioNetworkGraph} from '../../model/fl-bio-network-graph.class';
import {FormControl} from '@ngneat/reactive-forms';
import {debounceTime, map, startWith} from 'rxjs/operators';
import {FlBioNetworkObject} from '../../model/fl-bio-network.class';
import {FlBioNetworkSelectionState} from '../../state/fl-bio-network-selection.state';
import {ClHelpService, ClStringHelper, ClSubscriptionHandler} from '@monorepo/core-lib';
import {MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {FlBioNetworkDrawerState} from '../../state/fl-bio-network-drawer.state';

/**
 * Component to search on metabolite and reactions and select the object
 */
@Component({
  selector: 'fl-bio-network-node-search',
  templateUrl: './fl-bio-network-node-search.component.html',
  styleUrls: ['./fl-bio-network-node-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlBioNetworkNodeSearchComponent implements OnInit, OnDestroy {

  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;

  objects: FlBioNetworkObject[];
  filteredObjects$: Observable<FlBioNetworkObject[]>;

  searchControl: FormControl<string | FlBioNetworkObject> = new FormControl();

  private subscription: ClSubscriptionHandler = new ClSubscriptionHandler();

  constructor(private state: FlBioNetworkState,
              private selectionState: FlBioNetworkSelectionState,
              private drawerState: FlBioNetworkDrawerState,
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.getChartData();

    // Observable that refresh the filteredOptions each time a key is typed
    this.filteredObjects$ = this.searchControl.valueChanges
      .pipe(
        startWith(''),
        debounceTime(250),
        map((value: string | FlBioNetworkObject) => typeof value === 'string' ? value : value.name),
        map(name => name ? this.filter(name) : this.objects.slice())
      );

    // use to close the autocomplete panel when the drawer is closed
    this.subscription.add(this.drawerState.drawnOpenChange()
      .pipe(filter(drawnOpen => !drawnOpen))
      .subscribe(() => this.autocomplete.closePanel())
    );
  }

  private getChartData(): void {
    this.subscription.add(this.state.getChartData$().subscribe(
      network => this.onNewChartData(network)
    ));
  }

  private onNewChartData(bioNetwork: FlBioNetworkGraph): void {
    if (bioNetwork) {
      this.objects = ClHelpService.sortAlphabeticalOrder(bioNetwork.getMetabolitesAndReactionData(), object => object.name);
    } else {
      this.objects = [];
    }
    this.searchControl.patchValue('');
    this.cdr.markForCheck();
  }

  displayFn(metabolite: FlBioNetworkObject): string {
    return metabolite ? metabolite.name : '';
  }

  selectObject(): void {
    const object: string | FlBioNetworkObject = this.searchControl.value;
    if (object == null || typeof object === 'string') return;

    this.selectionState.selectMetaboliteAndReaction(object.id);
  }

  // method to filter metabolites based on string
  private filter(searchValue: string): FlBioNetworkObject[] {
    return this.objects.filter(object => ClStringHelper.stringContains(object.name, searchValue, true, true, true) ||
      ClStringHelper.stringContains(object.id, searchValue, true, true, true)
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }


}
