import {combineLatest, Observable, Subscription} from 'rxjs';
import {FlBioNetworkOptions} from '../state/fl-bio-network-options.state';
import {FlBioNetworkGraphRenderer} from './fl-bio-network-main.renderer';
import {FlBioNetworkClusterSelection, FlBioNetworkMetaboliteLevel} from '../model/fl-bio-network.class';
import {FlBioNetworkGraphObject} from '../model/fl-bio-network-graph.class';
import {
  FlBioNetworkSelectionEvent,
  FlBioNetworkSelectionEventSingleNode,
  FlBioNetworkSelectionMode
} from '../model/fl-bio-network-selection.class';
import {FlBioNetworkNodeReaction} from '../model/fl-bio-network-node-reaction.class';
import {FlBioNetworkNode} from '../model/fl-bio-network-node.class';


export type FlBioNetworkObjectColorFunction = (node: FlBioNetworkGraphObject) => string;

/**
 * Abstract class for rendering nodes and link of the network
 */
export abstract class FlBioNetworkObjectRenderer {

  private subscription: Subscription;


  protected constructor(protected graphRenderer: FlBioNetworkGraphRenderer,
                        protected options$: Observable<FlBioNetworkOptions>,
                        protected selection$: Observable<FlBioNetworkSelectionEvent>,
                        protected greyColor: string) {
    // every time the options or selection changes, update the graph
    this.subscription = combineLatest([options$, selection$]).subscribe(
      ([options, selection]) => this.refreshGraph(options, selection)
    );
  }

  abstract render(): void;

  private refreshGraph(options: FlBioNetworkOptions, selection: FlBioNetworkSelectionEvent): void {
    this.updateObjectColors(options);

    // show the cofactor only on node selection
    const modeToShowCofactor: FlBioNetworkSelectionMode[] = ['singleNodeByClick', 'singleNode', 'multipleNodes'];
    const showRelatedCofactors = modeToShowCofactor.includes(selection.mode);

    let selectedNodes: FlBioNetworkNode = null;
    if(selection.mode === 'singleNode' || selection.mode === 'singleNodeByClick'){
      selectedNodes = (selection as FlBioNetworkSelectionEventSingleNode).selectedNode;
    }

    // when showing related cofactor, firstly we reset the cofactor position (useful for the live drawing mode)
    if (showRelatedCofactors) {
      for (const node of selection.nodes) {
        if (node instanceof FlBioNetworkNodeReaction) {
          node.setCofactorsPositions();
        }
      }
    }

    this.updateVisibility(options.visibleLevels, selectedNodes, showRelatedCofactors);
  }


  protected abstract updateObjectColors(options: FlBioNetworkOptions): void;

  protected abstract updateVisibility(visibleLevels: FlBioNetworkMetaboliteLevel[],
                                      selectedNode: FlBioNetworkNode | null,
                                      showRelatedCofactor: boolean): void;


  protected getClusterColorFunction(clusters: FlBioNetworkClusterSelection[])
    : FlBioNetworkObjectColorFunction {
    return (node: FlBioNetworkGraphObject) => {
      for (const cluster of clusters) {
        if (node.isInCluster(cluster.name)) {
          return cluster.color;
        }
      }
      return this.greyColor;
    };
  }

  protected getDefaultColorFunction(): FlBioNetworkObjectColorFunction {
    return (node: FlBioNetworkGraphObject) => node.defaultColor;
  }

  protected getLevelVisibilityFunction(levels: FlBioNetworkMetaboliteLevel[]): (object: FlBioNetworkGraphObject) => boolean {
    return (object: FlBioNetworkGraphObject): boolean => levels.includes(object.getLevel());
  }


  destroy(): void {
    this.subscription?.unsubscribe();
  }

}
