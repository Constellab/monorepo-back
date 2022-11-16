import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaUserTwoFaToggleComponent} from './ca-user-two-fa-toggle.component';

describe('CaUserTwoFaToggleComponent', () => {
  let component: CaUserTwoFaToggleComponent;
  let fixture: ComponentFixture<CaUserTwoFaToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaUserTwoFaToggleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaUserTwoFaToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
