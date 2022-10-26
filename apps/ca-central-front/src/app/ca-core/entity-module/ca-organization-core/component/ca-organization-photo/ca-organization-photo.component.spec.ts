import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaOrganizationPhotoComponent} from './ca-organization-photo.component';

describe('CaOrganizationPhotoComponent', () => {
  let component: CaOrganizationPhotoComponent;
  let fixture: ComponentFixture<CaOrganizationPhotoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaOrganizationPhotoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaOrganizationPhotoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
