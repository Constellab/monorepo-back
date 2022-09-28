import {Component, Input, OnInit} from '@angular/core';
import {FlBioNetworkMetabolite} from '../../model/fl-bio-network.class';
import {ClHelpService} from '@monorepo/core-lib';
import {FlExternalLinkService} from '../../../../service/fl-external-link.service';

/**
 * Detail information for a Metabolite object
 */
@Component({
  selector: 'fl-bio-network-metabolite-detail',
  templateUrl: './fl-bio-network-metabolite-detail.component.html',
  styleUrls: ['./fl-bio-network-metabolite-detail.component.scss'],
})
export class FlBioNetworkMetaboliteDetailComponent implements OnInit {

  @Input() metabolite: FlBioNetworkMetabolite;

  constructor() {
  }

  ngOnInit(): void {
  }

  get chebiUrl(): string {
    if (ClHelpService.isNullOrEmpty(this.metabolite.chebi_id)) return null;

    return FlExternalLinkService.getChebiLink(this.metabolite.chebi_id);
  }
}
