import {Component, OnInit} from '@angular/core';
import {ClSupportedLanguage} from '@monorepo/core-lib';
import {AuthenticatedUserService} from '../../../core/service-api/authenticated-user.service';
import {MatSelectChange} from '@angular/material/select';

/**
 * Component to change the app language of the current user
 */
@Component({
  selector: 'gen-language-selection',
  templateUrl: './language-selection.component.html',
  styleUrls: ['./language-selection.component.scss']
})
export class LanguageSelectionComponent implements OnInit {

  language: ClSupportedLanguage;

  isLoading: boolean = false;

  previousValue: ClSupportedLanguage;

  constructor(private authenticatedUserService: AuthenticatedUserService) {
  }

  ngOnInit(): void {
    this.language = this.authenticatedUserService.getUser().lang;
    this.previousValue = this.language;
  }

  onLangChange(selectionChange: MatSelectChange): void {
    this.isLoading = true;
    this.authenticatedUserService.changeLanguage(selectionChange.value).subscribe(
      () => this.onLangChangeSuccess(selectionChange.value),
      () => this.onLangChangeError()
    );
  }

  private onLangChangeSuccess(lang: ClSupportedLanguage): void {
    this.previousValue = lang;
    this.isLoading = false;
  }

  private onLangChangeError(): void {
    // reset the lang
    this.language = this.previousValue;
    this.isLoading = false;
  }


}
