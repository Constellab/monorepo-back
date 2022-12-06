import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabVenvTableComponent} from './lab-venv-table.component';

describe('LabVenvTableComponent', () => {
  let component: LabVenvTableComponent;
  let fixture: ComponentFixture<LabVenvTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabVenvTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabVenvTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
