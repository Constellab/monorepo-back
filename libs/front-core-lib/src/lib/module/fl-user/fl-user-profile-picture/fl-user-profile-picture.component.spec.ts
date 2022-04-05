import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlUserProfilePictureComponent} from './fl-user-profile-picture.component';

describe('FlUserProfilePictureComponent', () => {
  let component: FlUserProfilePictureComponent;
  let fixture: ComponentFixture<FlUserProfilePictureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FlUserProfilePictureComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlUserProfilePictureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
