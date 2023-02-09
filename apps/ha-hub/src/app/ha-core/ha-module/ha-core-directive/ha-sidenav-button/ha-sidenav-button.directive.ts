import {Directive, ElementRef, HostListener, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Directive({
  selector: '[haSidenavButton]'
})
export class HaSidenavButtonDirective implements OnInit {
  isOpen: boolean = false;
  isActivated: boolean = false;

  constructor(private elementRef: ElementRef,
              private router: Router,) {
  }

  ngOnInit(): void {
    this.elementRef.nativeElement.innerHTML = 'menu';

    this.router.events.subscribe((e: any) => {
      if (e.type == 1) {
        const sidenav: any = this.elementRef.nativeElement.closest('.left-panel');
        if (sidenav.style.left != '0px') return;
        this.isOpen = false;
        sidenav.style.left = '-100%';
        this.elementRef.nativeElement.innerHTML = 'menu';
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    const sidenav: any = this.elementRef.nativeElement.closest('.left-panel');
    if(event.target.innerWidth > 1160 && this.isActivated) {
      sidenav.style.left = 'var(--margin-side)';
      this.isOpen = false;
      this.elementRef.nativeElement.innerHTML = 'menu';
      this.isActivated = false;
    }
  }

  @HostListener('document:click', ['$event', '$event.target'])
  public onClick(event: MouseEvent, targetElement: HTMLElement): void {
    const sidenav: any = this.elementRef.nativeElement.closest('.left-panel');

    if (sidenav == null || !targetElement) return;
    const clickedInside = sidenav.contains(targetElement);

    if (!clickedInside && window.innerWidth <= 1160) {
      this.isOpen = false;
      sidenav.style.left = '-100%';
      this.elementRef.nativeElement.innerHTML = 'menu';
      this.isActivated = true;
    } else if (targetElement == this.elementRef.nativeElement) {
      if (!this.isOpen) {
        sidenav.style.left = '0';
        this.isOpen = true;
        this.elementRef.nativeElement.innerHTML = 'close';
        this.isActivated = true;
      } else {
        this.isOpen = false;
        sidenav.style.left = '-100%';
        this.elementRef.nativeElement.innerHTML = 'menu';
        this.isActivated = true;
      }
    }
  }

}
