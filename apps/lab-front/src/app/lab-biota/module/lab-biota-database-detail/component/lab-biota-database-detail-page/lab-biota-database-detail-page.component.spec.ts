import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabBiotaDatabaseDetailPageComponent} from './lab-biota-database-detail-page.component';

describe('BiotaDatabaseDetailPageComponent', () => {
  let component: LabBiotaDatabaseDetailPageComponent;
  let fixture: ComponentFixture<LabBiotaDatabaseDetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabBiotaDatabaseDetailPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabBiotaDatabaseDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
