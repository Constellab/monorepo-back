import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabBiotaDatabaseCardComponent} from './lab-biota-database-card.component';

describe('BiotaDatabaseCardComponent', () => {
  let component: LabBiotaDatabaseCardComponent;
  let fixture: ComponentFixture<LabBiotaDatabaseCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabBiotaDatabaseCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabBiotaDatabaseCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
