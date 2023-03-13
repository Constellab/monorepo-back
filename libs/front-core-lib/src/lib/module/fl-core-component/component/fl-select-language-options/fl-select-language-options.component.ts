import {AfterViewInit, Component, Host, OnInit} from '@angular/core';
import {clLangNameMap, ClSupportedLanguage} from '@monorepo/core-lib';
import {FlEmbeddedOptionsAbstractDirective} from '../../../../abstract-directive/fl-embedded-options-abstract.directive';
import {MatLegacySelect as MatSelect} from '@angular/material/legacy-select';


/**
 * Embed option to generate the app language mat-options
 */
@Component({
  selector: 'fl-select-language-options',
  templateUrl: './fl-select-language-options.component.html',
  styleUrls: ['./fl-select-language-options.component.scss']
})
export class FlSelectLanguageOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit {

  language: Record<ClSupportedLanguage, string> = clLangNameMap;

  constructor(@Host() private select: MatSelect) {
    super(select);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }


}
