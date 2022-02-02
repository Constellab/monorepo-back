import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserInitiliasIconComponent } from './user-initilias-icon.component';

describe('UserInitiliasIconComponent', () => {
  let component: UserInitiliasIconComponent;
  let fixture: ComponentFixture<UserInitiliasIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserInitiliasIconComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserInitiliasIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
