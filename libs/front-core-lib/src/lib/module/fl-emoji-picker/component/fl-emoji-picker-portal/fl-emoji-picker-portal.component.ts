import {Component, ElementRef, OnInit} from '@angular/core';
import {FlOverlayRef, FlThemeService} from '@monorepo/front-core-lib';

@Component({
  selector: 'fl-emoji-picker-portal',
  templateUrl: './fl-emoji-picker-portal.component.html',
  styleUrls: ['./fl-emoji-picker-portal.component.scss']
})
export class FlEmojiPickerPortalComponent implements OnInit {

  constructor(private themeService: FlThemeService,
              private elementRef: ElementRef,
              private overlayRef: FlOverlayRef) {

  }

  ngOnInit(): void {
    const divScroll: HTMLElement = this.elementRef.nativeElement.querySelector('.emoji-mart-scroll');
    divScroll.classList.add('g-scrollable-element');
    const emojiMart: HTMLElement = this.elementRef.nativeElement.querySelector('emoji-mart');
    emojiMart.style.border = 'none';
    console.log(this.elementRef.nativeElement)
  }

  isDarkTheme(): boolean {
    return this.themeService.isDarkTheme()
  }

  addEmoji(event: any): void {
    this.overlayRef.dispose(event.emoji.native);
  }
}
