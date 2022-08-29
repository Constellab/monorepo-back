import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceViewHistoricComponent} from './lab-resource-view-historic.component';

describe('LabResourceViewHistoricComponent', () => {
  let component: LabResourceViewHistoricComponent;
  let fixture: ComponentFixture<LabResourceViewHistoricComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceViewHistoricComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabResourceViewHistoricComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
