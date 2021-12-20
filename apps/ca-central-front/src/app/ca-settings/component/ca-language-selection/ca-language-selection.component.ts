import {Component, OnInit} from '@angular/core';
import {ClSupportedLanguage} from '@monorepo/core-lib';
import {CaAuthenticatedUserService} from '../../../ca-core/service-api/ca-authenticated-user.service';
import {MatSelectChange} from '@angular/material/select';

/**
 * Component to change the app language of the current user
 */
@Component({
  selector: 'ca-language-selection',
  templateUrl: './ca-language-selection.component.html',
  styleUrls: ['./ca-language-selection.component.scss']
})
export class CaLanguageSelectionComponent implements OnInit {

  language: ClSupportedLanguage;

  isLoading: boolean = false;

  previousValue: ClSupportedLanguage;

  constructor(private authenticatedUserService: CaAuthenticatedUserService) {
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
