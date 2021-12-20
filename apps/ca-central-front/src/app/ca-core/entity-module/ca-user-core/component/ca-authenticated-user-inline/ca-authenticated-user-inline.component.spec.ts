import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaAuthenticatedUserInlineComponent} from './ca-authenticated-user-inline.component';

describe('AuthenticatedUserInlineCardComponent', () => {
  let component: CaAuthenticatedUserInlineComponent;
  let fixture: ComponentFixture<CaAuthenticatedUserInlineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaAuthenticatedUserInlineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaAuthenticatedUserInlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
