import {Component, Input, OnInit, Renderer2} from '@angular/core';
import {CaSmartDbDoc, CaSmartDbSentence} from '../../../model/ca-document.class';
import {FlPortalService} from '@monorepo/front-core-lib';
import {CaSmartDbSentenceDetailComponent} from '../ca-smart-db-sentence-detail/ca-smart-db-sentence-detail.component';

/**
 * Show the result complete abstract with highlighted information
 */
@Component({
  selector: 'ca-smart-db-content',
  templateUrl: './ca-smart-db-content.component.html',
  styleUrls: ['./ca-smart-db-content.component.scss']
})
export class CaSmartDbContentComponent implements OnInit {

  @Input() doc: CaSmartDbDoc;

  private readonly selectedClass = 'selected';

  constructor(private portalService: FlPortalService,
              private renderer: Renderer2) {
  }

  ngOnInit(): void {
  }


  contentClick(event: MouseEvent): void {
    const element: HTMLElement = event.target as any;

    if (element.tagName === 'MARK') {
      const sentence = this.findSentenceCurrentDoc(element.textContent);

      if (sentence == null) return;

      this.openSentenceDetail(element, sentence);
    }
  }

  private findSentenceCurrentDoc(sentence: string): CaSmartDbSentence | null {
    return this.doc.sentences.find(s => s.sentence.value === sentence);
  }

  private openSentenceDetail(element: HTMLElement, sentence: CaSmartDbSentence): void {
    this.renderer.addClass(element, this.selectedClass);
    const config = this.portalService.configureRelativePortal(element, ['top', 'bottom', 'left', 'right'],
      {
        disposeOnOutsideClick: true,
        disposeOnNavigation: true,
        elevation: true
      });

    this.portalService.createPortal(CaSmartDbSentenceDetailComponent, config, sentence).detachments()
      .subscribe(
        () => this.renderer.removeClass(element, this.selectedClass)
      );
  }
}
