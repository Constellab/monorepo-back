import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceDetailViewTabsComponent} from './lab-resource-detail-view-tabs.component';

describe('LabDetailResourceViewTabsComponent', () => {
  let component: LabResourceDetailViewTabsComponent;
  let fixture: ComponentFixture<LabResourceDetailViewTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceDetailViewTabsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourceDetailViewTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
