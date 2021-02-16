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

  constructor(private authenticatedUserService: AuthenticatedUserService) {
  }

  ngOnInit(): void {
    this.language = this.authenticatedUserService.getUser().lang;
  }

  onLangChange(selectionChange: MatSelectChange): void {
    this.isLoading = true;
    this.authenticatedUserService.changeLanguage(selectionChange.value).subscribe(
      () => this.isLoading = false,
      () => this.isLoading = false
    );
  }


}
