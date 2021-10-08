import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {FlExternalLinkService} from '../../../../service/fl-external-link.service';
import {FlBioNetworkD3Node} from '../../model/fl-bio-network-d3-node.class';

interface Link {
  link: string;
  name: string;
}


/**
 * Component to show a list of biographic links for the pathway node
 * Such as google scholar search, wikipedia...
 */
@Component({
  selector: 'fl-bio-network-node-links',
  templateUrl: './fl-bio-network-node-links.component.html',
  styleUrls: ['./fl-bio-network-node-links.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlBioNetworkNodeLinksComponent implements OnInit {

  @Input() set node(node: FlBioNetworkD3Node) {
    this.setLinks(node);
  }

  links: Link[];

  constructor() {
  }

  ngOnInit(): void {
  }

  private setLinks(node: FlBioNetworkD3Node): void {
    const links: Link[] = [];

    // google scholar search link
    links.push({name: 'Google scholar', link: FlExternalLinkService.getGoogleArchiveSearch(node.name)});

    // wikipedia search link
    links.push({name: 'Wikipédia', link: FlExternalLinkService.getWikipediaSearch(node.name)});

    this.links = links;
  }

}
