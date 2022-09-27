import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {FlExternalLinkService} from '../../../../service/fl-external-link.service';
import {FlBioNetworkNode} from '../../model/fl-bio-network-node.class';
import {FlBioNetworkNodeReaction} from '../../model/fl-bio-network-node-reaction.class';
import {ClHelpService} from '@monorepo/core-lib';

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

    // if this is a reaction, and it has an ec number, show brenda link
    if (node instanceof FlBioNetworkNodeReaction &&
      !ClHelpService.isNullOrEmpty(node.data.enzyme?.ec_number ?? null)) {
      // brenda link
      links.push({name: 'Brenda', link: FlExternalLinkService.getBrendaLink(node.data.enzyme.ec_number)});
    }

    // google scholar search link
    links.push({name: 'Google scholar', link: FlExternalLinkService.getGoogleArchiveSearch(node.name)});

    // wikipedia search link
    links.push({name: 'Wikipédia', link: FlExternalLinkService.getWikipediaSearch(node.name)});

    this.links = links;
  }

}
