import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FlBioNetworkState} from '../../state/fl-bio-network.state';
import {Observable} from 'rxjs';
import {filter} from 'rxjs/operators';
import {FlBioNetworkCompartment} from '../../model/fl-bio-network-compartment.class';
import {FlBioNetworkSelectionState} from '../../state/fl-bio-network-selection.state';


/**
 * Component inside the {@link FlBioNetworkComponent} to show the list of compartments and
 * highlight them on click
 */
@Component({
  selector: 'fl-bio-network-compartments',
  templateUrl: './fl-bio-network-compartments.component.html',
  styleUrls: ['./fl-bio-network-compartments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlBioNetworkCompartmentsComponent implements OnInit {

  compartments$: Observable<FlBioNetworkCompartment[]>;

  private selectedCompartments: Set<string> = new Set();

  constructor(private state: FlBioNetworkState,
              private selectionState: FlBioNetworkSelectionState,
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.compartments$ = this.state.getCompartments$();

    // reset the selected compartments on new selection
    this.selectionState.getSelectionMode$().pipe(
      filter(selection => selection.mode !== 'nodesByCompartments')
    ).subscribe(
      () => this.resetSelection()
    );
  }

  private resetSelection(): void {
    this.selectedCompartments.clear();
    this.cdr.markForCheck();
  }

  toggleCompartment(compartment: string): void {
    if (this.selectedCompartments.has(compartment)) {
      this.selectedCompartments.delete(compartment);
    } else {
      this.selectedCompartments.add(compartment);
    }

    this.selectionState.selectNodeByCompartments(Array.from(this.selectedCompartments));
  }

  getCompartmentOpacity(compartment: string): number {
    if (this.selectedCompartments.size === 0) return 1;
    return this.selectedCompartments.has(compartment) ? 1 : 0.1;
  }

}
