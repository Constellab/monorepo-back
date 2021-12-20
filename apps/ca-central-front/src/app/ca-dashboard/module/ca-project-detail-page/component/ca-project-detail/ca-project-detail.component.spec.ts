import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaProjectDetailComponent} from './ca-project-detail.component';

describe('ProjectCardDetailComponent', () => {
  let component: CaProjectDetailComponent;
  let fixture: ComponentFixture<CaProjectDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaProjectDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaProjectDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
