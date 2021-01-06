import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AuthenticatedUserInlineComponent} from './authenticated-user-inline.component';

describe('AuthenticatedUserInlineCardComponent', () => {
  let component: AuthenticatedUserInlineComponent;
  let fixture: ComponentFixture<AuthenticatedUserInlineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthenticatedUserInlineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthenticatedUserInlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
