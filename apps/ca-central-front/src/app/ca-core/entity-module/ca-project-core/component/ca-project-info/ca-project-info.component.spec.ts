import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaProjectInfoComponent} from './ca-project-info.component';

describe('ProjectInfoComponent', () => {
  let component: CaProjectInfoComponent;
  let fixture: ComponentFixture<CaProjectInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaProjectInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaProjectInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
