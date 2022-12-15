import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabMonitoringShareLinksPageComponent} from './lab-monitoring-share-links-page.component';

describe('LabMonitoringShareLinksPageComponent', () => {
  let component: LabMonitoringShareLinksPageComponent;
  let fixture: ComponentFixture<LabMonitoringShareLinksPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabMonitoringShareLinksPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabMonitoringShareLinksPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
