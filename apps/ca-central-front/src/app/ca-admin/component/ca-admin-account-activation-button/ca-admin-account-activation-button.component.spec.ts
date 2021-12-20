import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaAdminAccountActivationButtonComponent} from './ca-admin-account-activation-button.component';

describe('AdminAccountActivationComponent', () => {
  let component: CaAdminAccountActivationButtonComponent;
  let fixture: ComponentFixture<CaAdminAccountActivationButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaAdminAccountActivationButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaAdminAccountActivationButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
