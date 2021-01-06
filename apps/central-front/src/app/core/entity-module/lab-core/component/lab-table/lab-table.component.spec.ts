import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabTableComponent} from './lab-table.component';

describe('LabTableComponent', () => {
  let component: LabTableComponent;
  let fixture: ComponentFixture<LabTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
