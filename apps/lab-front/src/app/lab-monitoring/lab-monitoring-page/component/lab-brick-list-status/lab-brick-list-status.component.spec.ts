import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabBrickListStatusComponent} from './lab-brick-list-status.component';

describe('LabBrickListStatusComponent', () => {
  let component: LabBrickListStatusComponent;
  let fixture: ComponentFixture<LabBrickListStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabBrickListStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabBrickListStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
