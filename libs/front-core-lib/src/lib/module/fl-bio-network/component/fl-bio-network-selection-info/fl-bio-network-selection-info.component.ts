import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {FlBioNetworkSelectionEvent} from '../../model/fl-bio-network-selection.class';
import {map} from 'rxjs/operators';
import {FlBioNetworkState} from '../../state/fl-bio-network.state';
import {FlBioNetworkGraph} from '../../model/fl-bio-network-graph.class';
import {FlBioNetworkSelectionState} from '../../state/fl-bio-network-selection.state';
import {FlBioNetworkNode} from '../../model/fl-bio-network-node.class';

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

  constructor(private selectionState: FlBioNetworkSelectionState,
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

    const metabolites: FlBioNetworkNode[] = [];
    const cofactors: FlBioNetworkNode[] = [];
    const reactions: FlBioNetworkNode[] = [];

    // count the elements from the selection event
    if (selection.nodes != null) {

      // count each node type
      selection.nodes.forEach(node => {
        switch (node.type) {
          case 'metabolite':
            metabolites.push(node);
            break;
          case 'cofactor':
            cofactors.push(node);
            break;
          case 'reaction':
            reactions.push(node);
            break;
        }
      });

      info.metabolites = this.removeDuplicate(metabolites).length;
      info.cofactors = this.removeDuplicate(cofactors).length;
      info.reactions = this.removeDuplicate(reactions).length;
    }

    if (selection.links != null) {
      info.links = selection.links.length;
    }

    return info;
  }

  private getAllSelectionInfo(): SelectionInfo {
    const data: FlBioNetworkGraph = this.state.getCurrentChartData();
    if (data) {
      return {
        metabolites: this.removeDuplicate(data.metabolites).length,
        cofactors: this.removeDuplicate(data.cofactors).length,
        reactions: this.removeDuplicate(data.reactions).length,
        links: data.links.length
      };
    }

    return {};
  }

  // remove duplicate nodes from an array (base on data.id)
  private removeDuplicate(nodes: FlBioNetworkNode[]): FlBioNetworkNode[]{
    const seen = new Set();
    return nodes.filter((item)  =>{
      const id = item.data.id;
      if(seen.has(id)){
        return false;
      }else{
        seen.add(id);
        return true;
      }
    })
  }

}
