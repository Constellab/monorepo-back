import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaAdminAccountsActivationComponent} from './ca-admin-accounts-activation.component';

describe('AdminAccountActivationComponent', () => {
  let component: CaAdminAccountsActivationComponent;
  let fixture: ComponentFixture<CaAdminAccountsActivationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaAdminAccountsActivationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaAdminAccountsActivationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
