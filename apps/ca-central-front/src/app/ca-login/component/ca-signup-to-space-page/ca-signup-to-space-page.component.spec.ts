import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSignupToSpacePageComponent} from './ca-signup-to-space-page.component';

describe('CaJoinSpacePageComponent', () => {
  let component: CaSignupToSpacePageComponent;
  let fixture: ComponentFixture<CaSignupToSpacePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSignupToSpacePageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaSignupToSpacePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
