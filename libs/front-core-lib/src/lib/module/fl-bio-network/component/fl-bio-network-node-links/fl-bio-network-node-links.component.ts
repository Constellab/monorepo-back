import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {FlExternalLinkService} from '../../../../service/fl-external-link.service';
import {FlBioNetworkNode} from '../../model/fl-bio-network-node.class';

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

  @Input() set node(node: FlBioNetworkNode) {
    this.setLinks(node);
  }

  links: Link[];

  constructor() {
  }

  ngOnInit(): void {
  }

  private setLinks(node: FlBioNetworkNode): void {
    const links: Link[] = [];

    // google scholar search link
    links.push({name: 'Google scholar', link: FlExternalLinkService.getGoogleArchiveSearch(node.name)});

    // wikipedia search link
    links.push({name: 'Wikipédia', link: FlExternalLinkService.getWikipediaSearch(node.name)});

    this.links = links;
  }

}
