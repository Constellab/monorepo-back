import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AdminAccountsActivationComponent} from './admin-accounts-activation.component';

describe('AdminAccountActivationComponent', () => {
  let component: AdminAccountsActivationComponent;
  let fixture: ComponentFixture<AdminAccountsActivationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminAccountsActivationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAccountsActivationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
