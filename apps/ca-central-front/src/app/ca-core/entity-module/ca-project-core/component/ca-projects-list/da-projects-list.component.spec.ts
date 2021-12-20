import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DaProjectsListComponent} from './da-projects-list.component';

describe('ProjectsListComponent', () => {
  let component: DaProjectsListComponent;
  let fixture: ComponentFixture<DaProjectsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DaProjectsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DaProjectsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
