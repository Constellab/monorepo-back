import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabProcessPortsListComponent} from './lab-process-ports-list.component';

describe('BioxProcessPortsListComponent', () => {
  let component: LabProcessPortsListComponent;
  let fixture: ComponentFixture<LabProcessPortsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabProcessPortsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabProcessPortsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
