import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabLoginButtonComponent} from './ca-lab-login-button.component';

describe('CaLabLoginButtonComponent', () => {
  let component: CaLabLoginButtonComponent;
  let fixture: ComponentFixture<CaLabLoginButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabLoginButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLabLoginButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
