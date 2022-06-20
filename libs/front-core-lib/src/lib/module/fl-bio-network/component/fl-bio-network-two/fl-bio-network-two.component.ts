import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {FlBioNetwork} from '../../model/fl-bio-network.class';
import ForceGraph, {GraphData} from 'force-graph';
import {FlBioNetworkState} from '../../state/fl-bio-network.state';
import {FlBioNetworkD3} from '../../model/fl-bio-network-d3.class';
import {FlBioNetworkFactory} from '../../utils/fl-bio-network.factory';
import {FlThemeService} from '../../../../service/fl-theme.service';
import {Simulation} from 'd3-force';
import {FlBioNetworkD3Node} from '../../model/fl-bio-network-d3-node.class';
import {forceLink, forceManyBody, forceSimulation} from 'd3';
import {MatDrawer, MatSidenav} from '@angular/material/sidenav';
import {FlBioNetworkDrawerState} from '../../state/fl-bio-network-drawer.state';
import {FlBioNetworkOptionsState} from '../../state/fl-bio-network-options.state';
import {FlBioNetworkSelectionTwoState} from '../../state/fl-bio-network-selection-two.state';
import {FlBioNetworkRendererTwoState} from '../../state/fl-bio-network-renderer-two.state';


@Component({
  selector: 'fl-bio-network-two',
  templateUrl: './fl-bio-network-two.component.html',
  styleUrls: ['./fl-bio-network-two.component.scss'],
  providers: [
    FlBioNetworkState,
    FlBioNetworkDrawerState,
    FlBioNetworkOptionsState,
    FlBioNetworkSelectionTwoState,
    FlBioNetworkRendererTwoState,
  ]
})
export class FlBioNetworkTwoComponent implements OnInit {
  @Input() networks: FlBioNetwork;

  @ViewChild('networkContainer', {static: true}) networkContainer: ElementRef;
  // TOdo swtich to drawer
  @ViewChild(MatSidenav, {static: true}) drawer: MatDrawer;


  private simulation: Simulation<FlBioNetworkD3Node, any>;
  private simulationEnded: boolean = false;

  private data: FlBioNetworkD3;


  constructor(private state: FlBioNetworkState,
              private drawerState: FlBioNetworkDrawerState,
              private selectionState: FlBioNetworkSelectionTwoState,
              private rendererState: FlBioNetworkRendererTwoState,
              private themeService: FlThemeService) {
  }

  ngOnInit(): void {
    this.state.init(this.networks, 'kegg');
    // init the drawer state
    this.drawerState.init(this.drawer);


    this.initData();
    this.selectionState.init(this.data);
    this.initSimulation();


    this.simulation.on('end', () => {
      this.endSimulation();
      this.drawGraph();
    });

  }

  private initData(): void {
    const clusters = this.state.getCurrentClusters().map(cluster => cluster.id);
    this.data = new FlBioNetworkFactory(this.themeService.getCurrentThemeDetail())
      .convertNetworkToNetworkD3(this.networks, clusters, 'kegg');
  }

  private drawGraph(): void {
    const width = this.networkContainer.nativeElement.clientWidth;
    const height = this.networkContainer.nativeElement.clientHeight;

    const graphData = this.dataToGraph();
    const myGraph = ForceGraph();

    myGraph(this.networkContainer.nativeElement)
      .graphData(graphData).width(width).height(height)
      .nodeVal(() => 5)
      .cooldownTicks(0) // pre-defined layout, cancel force engine iterations
      .linkColor(() => '#ffffff')
      .onNodeClick((node: any) => this.selectionState.selectNodeAndDirectLinks(node))
      .nodeCanvasObject((node: any, ctx) => this.nodePaint(node as any, ctx)) // todo fix any, due to index symbol
      .nodePointerAreaPaint((node: any, color: string, ctx: CanvasRenderingContext2D) =>
        this.nodePaintPointerArea(node, ctx, color)) // todo fix any, due to index symbol
      .autoPauseRedraw(true)
      .linkColor((link: any) => link.selected ? 'red' : link.defaultColor)
    ;

    this.rendererState.init(myGraph, this.data);
    // .linkDirectionalParticles(() => 10)
    // .linkDirectionalParticleSpeed(() => 0.01);
  }

  private nodePaint(node: FlBioNetworkD3Node, ctx: CanvasRenderingContext2D): void {
    // if the color is provided, it is a unique color for the pointer area

    if (node.type === 'metabolite') {
      // add white ring
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(node.x, node.y, 12, 0, 2 * Math.PI, false);
      ctx.fill();

      ctx.fillStyle = node.selected ? 'red' : node.defaultColor;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 10, 0, 2 * Math.PI, false);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Sans-Serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 7;
      ctx.textBaseline = 'middle';
      ctx.fillText(node.name, node.x, node.y + 20);
      ctx.shadowBlur = 0;

    } else if (node.type === 'reaction') {
      // add white ring
      ctx.fillStyle = '#ffffff';
      this.roundedRect(ctx, node.x - 5, node.y - 5, 10, 10, 2);
      ctx.fillStyle = node.selected ? 'red' : node.defaultColor;
      this.roundedRect(ctx, node.x - 4, node.y - 4, 8, 8, 2);
      // ctx.fillRect(node.x - 4, node.y - 4, 8, 8);
    } else {
      console.log('node type not supported');
    }
  }

  private nodePaintPointerArea(node: FlBioNetworkD3Node, ctx: CanvasRenderingContext2D, color: string): void {
    // if the color is provided, it is a unique color for the pointer area
    ctx.fillStyle = color;

    if (node.type === 'metabolite') {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 10, 0, 2 * Math.PI, false);
      ctx.fill();
    } else if (node.type === 'reaction') {
      // ctx.fillRect(node.x - 4, node.y - 4, 8, 8);
      this.roundedRect(ctx, node.x - 4, node.y - 4, 8, 8, 1);
    } else {
      console.log('node type not supported');
    }
  }

  private initSimulation(): void {
    this.simulation = forceSimulation(this.data.getMetabolitesAndReactions())
      .force('link',
        forceLink(this.data.links)
        // .id((d: FlBioNetworkD3Node) => d.id)
      )
      .force('charge', forceManyBody()).alphaDecay(0.05);
  }

  // disable all force so the user can move the node independently
  private endSimulation(): void {
    if (!this.simulationEnded) {
      // clear all forces, so the user can drag easily
      this.simulation.force('link', null);
      this.simulation.force('charge', null);
      this.simulation.force('center', null);
      this.simulation.force('collide', null);
      this.simulation.stop();
      this.simulationEnded = true;
      // save the new positions
      this.data.savePositions();
    }
  }

  private dataToGraph(): GraphData {
    return {
      nodes: [...this.data.metabolites, ...this.data.reactions],
      links: this.data.links
    } as any;
  }

  private roundedRect(ctx: CanvasRenderingContext2D,
                      x: number, y: number,
                      width: number, height: number,
                      radius: number = 5, mode: 'fill' | 'stroke' = 'fill'): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (mode === 'fill') {
      ctx.fill();
    } else {
      ctx.stroke();
    }
  }

  private getBasicGraph(): GraphData {
    const graph: GraphData = {
      nodes: [],
      links: []
    };

    for (const metabolite of this.networks.metabolites) {
      graph.nodes.push({
        id: metabolite.id,
        name: metabolite.name,
      } as any); // Todo fix
    }

    for (const reaction of this.networks.reactions) {
      graph.nodes.push({
        id: reaction.id,
        name: reaction.name,
      } as any); // Todo fix

      for (const metaboliteId of Object.keys(reaction.metabolites)) {
        graph.links.push({
          source: metaboliteId,
          target: reaction.id,
        });
      }
    }
    return graph;
  }

  openDrawer(): void {
    this.drawerState.openDrawer();
  }

  closeDrawer(): void {
    this.drawerState.closeDrawer();
  }

}
