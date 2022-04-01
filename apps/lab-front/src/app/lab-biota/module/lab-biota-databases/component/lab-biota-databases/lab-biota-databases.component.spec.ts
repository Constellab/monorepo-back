import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabBiotaDatabasesComponent} from './lab-biota-databases.component';

describe('BiotaDatabasesComponent', () => {
  let component: LabBiotaDatabasesComponent;
  let fixture: ComponentFixture<LabBiotaDatabasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabBiotaDatabasesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabBiotaDatabasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
