import {Component, Input, OnInit} from '@angular/core';
import {FlExternalLinkService} from '../../../../../../../service/fl-external-link.service';
import {FlChartPathwayNode} from '../../model/fl-chart-pathway.class';

interface Link {
  link: string;
  name: string;
}


/**
 * Component to show a list of biographic links for the pathway node
 * Such as google scholar search, wikipedia...
 */
@Component({
  selector: 'fl-chart-pathway-node-links',
  templateUrl: './fl-chart-pathway-node-links.component.html',
  styleUrls: ['./fl-chart-pathway-node-links.component.scss']
})
export class FlChartPathwayNodeLinksComponent implements OnInit {

  @Input() set node(node: FlChartPathwayNode) {
    this.setLinks(node);
  }

  links: Link[];

  constructor() {
  }

  ngOnInit(): void {
  }

  private setLinks(node: FlChartPathwayNode): void {
    const links: Link[] = [];

    // google scholar search link
    links.push({name: 'Google scholar', link: FlExternalLinkService.getGoogleArchiveSearch(node.name)});

    // wikipedia search link
    links.push({name: 'Wikipédia', link: FlExternalLinkService.getWikipediaSearch(node.name)});

    this.links = links;
  }

}
