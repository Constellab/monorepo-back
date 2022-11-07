import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaCurrentOrgaProjectsListComponent} from './ca-current-orga-projects-list.component';

describe('CaCurrentOrgaProjectsListComponent', () => {
  let component: CaCurrentOrgaProjectsListComponent;
  let fixture: ComponentFixture<CaCurrentOrgaProjectsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaCurrentOrgaProjectsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaCurrentOrgaProjectsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
