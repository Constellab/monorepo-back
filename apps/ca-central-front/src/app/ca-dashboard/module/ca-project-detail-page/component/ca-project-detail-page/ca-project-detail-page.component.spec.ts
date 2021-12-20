import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaProjectDetailPageComponent} from './ca-project-detail-page.component';

describe('ProjectDetailPageComponent', () => {
  let component: CaProjectDetailPageComponent;
  let fixture: ComponentFixture<CaProjectDetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaProjectDetailPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaProjectDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
