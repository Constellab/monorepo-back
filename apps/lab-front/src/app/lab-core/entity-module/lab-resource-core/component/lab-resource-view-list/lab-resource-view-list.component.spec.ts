import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceViewListComponent} from './lab-resource-view-list.component';

describe('LabResourcesListComponent', () => {
  let component: LabResourceViewListComponent;
  let fixture: ComponentFixture<LabResourceViewListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceViewListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourceViewListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
