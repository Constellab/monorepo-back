import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabBrickInfoComponent} from './lab-brick-info.component';

describe('LabBrickInfoComponent', () => {
  let component: LabBrickInfoComponent;
  let fixture: ComponentFixture<LabBrickInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabBrickInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabBrickInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
