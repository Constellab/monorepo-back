import {ComponentFixture, TestBed} from '@angular/core/testing';

import {StudyDetailPageComponent} from './study-detail-page.component';

describe('StudyDetailPageComponent', () => {
  let component: StudyDetailPageComponent;
  let fixture: ComponentFixture<StudyDetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudyDetailPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
