import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaUserProfileSectionComponent } from './ca-user-profile-section.component';

describe('CaPhotoSectionComponent', () => {
  let component: CaUserProfileSectionComponent;
  let fixture: ComponentFixture<CaUserProfileSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaUserProfileSectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaUserProfileSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
