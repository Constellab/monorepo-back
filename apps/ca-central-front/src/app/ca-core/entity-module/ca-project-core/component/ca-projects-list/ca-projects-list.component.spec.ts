import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaProjectsListComponent} from './ca-projects-list.component';

describe('ProjectsListComponent', () => {
  let component: CaProjectsListComponent;
  let fixture: ComponentFixture<CaProjectsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaProjectsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaProjectsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
