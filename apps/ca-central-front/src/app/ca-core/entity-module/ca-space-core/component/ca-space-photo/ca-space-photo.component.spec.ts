import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSpacePhotoComponent} from './ca-space-photo.component';

describe('CaSpacePhotoComponent', () => {
  let component: CaSpacePhotoComponent;
  let fixture: ComponentFixture<CaSpacePhotoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSpacePhotoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaSpacePhotoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
