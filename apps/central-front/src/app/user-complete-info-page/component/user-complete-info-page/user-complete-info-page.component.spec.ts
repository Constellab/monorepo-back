import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCompleteInfoPageComponent } from './user-complete-info-page.component';

describe('UserCompleteInfoPageComponent', () => {
  let component: UserCompleteInfoPageComponent;
  let fixture: ComponentFixture<UserCompleteInfoPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserCompleteInfoPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserCompleteInfoPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
