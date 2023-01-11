import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {CommonModule} from '@angular/common';
import katex from 'katex';
import {Observable, Subscription} from 'rxjs';
import {FlThemeService} from '@monorepo/front-core-lib';

/**
 * Standalone component that uses KaTeX to render mathematical formula
 * Use a standalone component because KaTeX is a big library
 */
@Component({
  selector: 'fl-formula',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fl-formula.component.html',
  styleUrls: ['./fl-formula.component.scss'],
  // use encapsulation to import KaTeX styles
  encapsulation: ViewEncapsulation.None

})
export class FlFormulaComponent implements OnInit, OnDestroy {

  @Input() set formula(formula: string | Observable<string>) {
    this.clear();
    if (formula instanceof Observable) {
      this.subscription = formula.subscribe((formula) => this.onFormulaChange(formula));
    } else {
      this.onFormulaChange(formula);
    }
  }

  @ViewChild('container', {static: true}) container: ElementRef<HTMLElement>;

  private subscription: Subscription;

  constructor(private themeService: FlThemeService) {
  }

  ngOnInit(): void {
  }

  private onFormulaChange(formula: string): void {
    const macros = {
      '\\f': '#1f(#2)',
    };
    katex.render(formula, this.container.nativeElement, {
      macros,
      throwOnError: false,
      errorColor: this.themeService.getCurrentThemeDetail().warn
    });
  }

  private clear(): void {
    this.subscription?.unsubscribe();
    this.subscription = null;
  }

  ngOnDestroy(): void {
    this.clear();
  }


}
