import {Component, Input, OnInit} from '@angular/core';

/**
 * Module to show a link that redirect to an external page
 * This add an icon the the link to warn the user it is an external link
 */
@Component({
  selector: 'fl-external-link',
  templateUrl: './fl-external-link.component.html',
  styleUrls: ['./fl-external-link.component.scss']
})
export class FlExternalLinkComponent implements OnInit {

  @Input() link: string;

  /**
   * Text show instead of the link,
   * if not provided, the link is showed
   */
  @Input() text: string;

  @Input() target: '_blank' | '_parent' | '_self' | '_top' = '_blank';

  constructor() {
  }

  ngOnInit(): void {
  }

  get linkText(): string {
    return this.text ?? this.link;
  }

}
