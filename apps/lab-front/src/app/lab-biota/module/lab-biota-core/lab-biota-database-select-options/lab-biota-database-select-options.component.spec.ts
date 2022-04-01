import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabBiotaDatabaseSelectOptionsComponent} from './lab-biota-database-select-options.component';

describe('BiotaDatabaseSelectOptionsComponent', () => {
  let component: LabBiotaDatabaseSelectOptionsComponent;
  let fixture: ComponentFixture<LabBiotaDatabaseSelectOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabBiotaDatabaseSelectOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabBiotaDatabaseSelectOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
