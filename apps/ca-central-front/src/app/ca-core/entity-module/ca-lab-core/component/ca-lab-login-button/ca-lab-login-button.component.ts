import {Component, Input, OnInit} from '@angular/core';
import {CaLabInstanceService} from '../../../../service-api/ca-lab-instance.service';
import {ClHelpService} from '@monorepo/core-lib';

@Component({
  selector: 'ca-lab-login-button',
  templateUrl: './ca-lab-login-button.component.html',
  styleUrls: ['./ca-lab-login-button.component.scss']
})
export class CaLabLoginButtonComponent implements OnInit {

  @Input() labInstanceId: string;

  @Input() isRunning: boolean = false;

  @Input() size: 'small' | 'normal' = 'normal';

  isLoading: boolean = false;

  constructor(private labInstanceService: CaLabInstanceService) {
  }

  ngOnInit(): void {
  }

  loginToLab(event: MouseEvent): void {
    ClHelpService.stopEventPropagation(event);
    this.isLoading = true;
    this.labInstanceService.logUserToLab(this.labInstanceId).subscribe({
      next: result => this.loginSuccess(result.url),
      error: () => this.isLoading = false
    });
  }

  private loginSuccess(url: string): void {
    // redirect to the lab url
    window.location.href = url;
    this.isLoading = false;
  }

  get buttonClass(): string {
    return this.size === 'small' ? 'g-button-small' : '';
  }

  // prevent ripple effect when used on card
  stopEventPropagation(event: Event): void {
    event.stopPropagation();
  }

}
