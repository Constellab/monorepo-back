import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaProjectSharedGroupsListComponent} from './ca-project-shared-groups-list.component';

describe('CaProjectSharedGroupsListComponent', () => {
  let component: CaProjectSharedGroupsListComponent;
  let fixture: ComponentFixture<CaProjectSharedGroupsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaProjectSharedGroupsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaProjectSharedGroupsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
