import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaSignupPageComponent } from './ca-signup-page.component';

describe('CaSignupPageComponent', () => {
  let component: CaSignupPageComponent;
  let fixture: ComponentFixture<CaSignupPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSignupPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaSignupPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
