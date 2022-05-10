import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaGroupsListComponent} from './ca-groups-list.component';

describe('CaGroupsListComponent', () => {
  let component: CaGroupsListComponent;
  let fixture: ComponentFixture<CaGroupsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaGroupsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaGroupsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
