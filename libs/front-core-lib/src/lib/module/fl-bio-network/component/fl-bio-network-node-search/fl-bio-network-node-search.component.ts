import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {FlBioNetworkState} from '../../state/fl-bio-network.state';
import {Observable, Subscription} from 'rxjs';
import {FlBioNetworkGraph} from '../../model/fl-bio-network-graph.class';
import {FlBioNetworkNodeMetabolite} from '../../model/fl-bio-network-node-metabolite.class';
import {FormControl} from '@ngneat/reactive-forms';
import {debounceTime, map, startWith} from 'rxjs/operators';
import {FlBioNetworkMetabolite} from '../../model/fl-bio-network.class';
import {FlBioNetworkSelectionState} from '../../state/fl-bio-network-selection.state';

/**
 * Component to search on metabolite and select a metabolite
 */
@Component({
  selector: 'fl-bio-network-node-search',
  templateUrl: './fl-bio-network-node-search.component.html',
  styleUrls: ['./fl-bio-network-node-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlBioNetworkNodeSearchComponent implements OnInit, OnDestroy {

  metabolites: FlBioNetworkMetabolite[];
  filteredMetabolite: Observable<FlBioNetworkMetabolite[]>;

  searchControl: FormControl<string | FlBioNetworkMetabolite> = new FormControl();

  private subscription: Subscription;

  constructor(private state: FlBioNetworkState,
              private selectionState: FlBioNetworkSelectionState,
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.getChartData();

    // Observable that refresh the filteredOptions each time a key is typed
    this.filteredMetabolite = this.searchControl.valueChanges
      .pipe(
        startWith(''),
        debounceTime(250),
        map((value: string | FlBioNetworkMetabolite) => typeof value === 'string' ? value : value.name),
        map(name => name ? this.filter(name) : this.metabolites.slice())
      );
  }

  private getChartData(): void {
    this.subscription = this.state.getChartData$().subscribe(
      network => this.onNewChartData(network)
    );
  }

  private onNewChartData(bioNetwork: FlBioNetworkGraph): void {
    if (bioNetwork) {
      this.metabolites = bioNetwork.getMetabolitesData();
    } else {
      this.metabolites = [];
    }
    this.searchControl.patchValue('');
    this.cdr.markForCheck();
  }

  displayFn(metabolite: FlBioNetworkNodeMetabolite): string {
    return metabolite ? metabolite.name : '';
  }

  selectMetabolite(): void {
    const metabolite: string | FlBioNetworkMetabolite = this.searchControl.value;
    if (metabolite == null || typeof metabolite === 'string') return;

    this.selectionState.selectMetabolite(metabolite.id);
  }

  // method to filter metabolites based on string
  private filter(name: string): FlBioNetworkMetabolite[] {
    const filterValue = name.toLowerCase();
    return this.metabolites.filter(metabolite => metabolite.name.toLowerCase().includes(filterValue));
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }


}
