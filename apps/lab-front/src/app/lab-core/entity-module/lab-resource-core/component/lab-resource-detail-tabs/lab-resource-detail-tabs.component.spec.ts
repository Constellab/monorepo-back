import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceDetailTabsComponent} from './lab-resource-detail-tabs.component';

describe('LabResourceDetailTabs2Component', () => {
  let component: LabResourceDetailTabsComponent;
  let fixture: ComponentFixture<LabResourceDetailTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceDetailTabsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabResourceDetailTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
