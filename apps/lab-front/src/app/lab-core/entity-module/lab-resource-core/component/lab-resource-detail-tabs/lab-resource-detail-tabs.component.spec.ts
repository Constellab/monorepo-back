import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceDetailTabsComponent} from './lab-resource-detail-tabs.component';

describe('LabResourceDetailThreeComponent', () => {
  let component: LabResourceDetailTabsComponent;
  let fixture: ComponentFixture<LabResourceDetailTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceDetailTabsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourceDetailTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
