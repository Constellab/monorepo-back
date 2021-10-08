import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {FlBioNetworkState} from '../../state/fl-bio-network.state';
import {FlBioNetworkSelectionState} from '../../state/fl-bio-network-selection.state';
import {Observable, Subscription} from 'rxjs';
import {FlBioxNetworkD3} from '../../model/fl-bio-network-d3.class';
import {FlBioNetworkD3Metabolite} from '../../model/fl-bio-network-d3-metabolite.class';
import {FormControl} from '@ngneat/reactive-forms';
import {map, startWith} from 'rxjs/operators';

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

  metabolites: FlBioNetworkD3Metabolite[];
  filteredMetabolite: Observable<FlBioNetworkD3Metabolite[]>;

  searchControl: FormControl<string | FlBioNetworkD3Metabolite> = new FormControl();

  private subscription: Subscription;

  constructor(private state: FlBioNetworkState, private selectionState: FlBioNetworkSelectionState,
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.getChartData();

    // Observable that refresh the filteredOptions each time a key is typed
    this.filteredMetabolite = this.searchControl.valueChanges
      .pipe(
        startWith(''),
        map((value: string | FlBioNetworkD3Metabolite) => typeof value === 'string' ? value : value.name),
        map(name => name ? this.filter(name) : this.metabolites.slice())
      );
  }

  private getChartData(): void {
    this.subscription = this.state.getChartData$().subscribe(
      network => this.onNewChartData(network)
    );
  }

  private onNewChartData(bioNetwork: FlBioxNetworkD3): void {
    if (bioNetwork) {
      this.metabolites = bioNetwork.metabolites;
    } else {
      this.metabolites = [];
    }
    this.searchControl.patchValue('');
    this.cdr.markForCheck();
  }

  displayFn(metabolite: FlBioNetworkD3Metabolite): string {
    return metabolite ? metabolite.name : '';
  }

  selectMetabolite(): void {
    const metabolite: string | FlBioNetworkD3Metabolite = this.searchControl.value;
    if (metabolite == null || !(metabolite instanceof FlBioNetworkD3Metabolite)) return;

    this.selectionState.selectNodeAndDirectLinks(metabolite, true);
  }

  // method to filter metabolites based on string
  private filter(name: string): FlBioNetworkD3Metabolite[] {
    const filterValue = name.toLowerCase();
    return this.metabolites.filter(metabolite => metabolite.name.toLowerCase().includes(filterValue));
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }


}
