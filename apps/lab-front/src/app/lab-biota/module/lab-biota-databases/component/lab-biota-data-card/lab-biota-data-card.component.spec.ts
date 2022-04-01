import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabBiotaDataCardComponent} from './lab-biota-data-card.component';

describe('BiotaDataCardComponent', () => {
  let component: LabBiotaDataCardComponent;
  let fixture: ComponentFixture<LabBiotaDataCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabBiotaDataCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabBiotaDataCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
