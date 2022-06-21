import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {FlBioNetworkSelectionEvent} from '../../model/fl-bio-network-selection.class';
import {map} from 'rxjs/operators';
import {FlBioNetworkState} from '../../state/fl-bio-network.state';
import {FlBioNetworkD3} from '../../model/fl-bio-network-d3.class';
import {FlBioNetworkSelectionTwoState} from '../../state/fl-bio-network-selection-two.state';

interface SelectionInfo {
  metabolites?: number;
  cofactors?: number;
  reactions?: number;
  links?: number;
}

/**
 * Component inside {@link FlBioNetworkComponent} to show information about the current selection
 */
@Component({
  selector: 'fl-bio-network-selection-info',
  templateUrl: './fl-bio-network-selection-info.component.html',
  styleUrls: ['./fl-bio-network-selection-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlBioNetworkSelectionInfoComponent implements OnInit {

  info$: Observable<SelectionInfo>;

  constructor(private selectionState: FlBioNetworkSelectionTwoState,
              private state: FlBioNetworkState) {
  }

  ngOnInit(): void {
    this.info$ = this.selectionState.getSelectionMode$().pipe(
      map(selection => this.countSelections(selection))
    );
  }

  private countSelections(selection: FlBioNetworkSelectionEvent): SelectionInfo {
    // on none selection, get all the data
    if (selection.mode === 'none') {
      return this.getAllSelectionInfo();
    }

    const info: SelectionInfo = {};

    // count the elements from the selection event
    if (selection.nodes != null) {
      info.metabolites = 0;
      info.cofactors = 0;
      info.reactions = 0;

      // count each node type
      selection.nodes.forEach(node => {
        switch (node.type) {
          case 'metabolite':
            info.metabolites++;
            break;
          case 'cofactor':
            info.cofactors++;
            break;
          case 'reaction':
            info.reactions++;
            break;
        }
      });
    }

    if (selection.links != null) {
      info.links = selection.links.length;
    }

    return info;
  }

  private getAllSelectionInfo(): SelectionInfo {
    const data: FlBioNetworkD3 = this.state.getCurrentChartData();
    if (data) {
      return {
        metabolites: data.metabolites.length,
        cofactors: data.cofactors.length,
        reactions: data.reactions.length,
        links: data.links.length
      };
    }

    return {};
  }

}
