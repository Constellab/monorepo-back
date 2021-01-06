import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AdminAccountActivationButtonComponent} from './admin-account-activation-button.component';

describe('AdminAccountActivationComponent', () => {
  let component: AdminAccountActivationButtonComponent;
  let fixture: ComponentFixture<AdminAccountActivationButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminAccountActivationButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAccountActivationButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
