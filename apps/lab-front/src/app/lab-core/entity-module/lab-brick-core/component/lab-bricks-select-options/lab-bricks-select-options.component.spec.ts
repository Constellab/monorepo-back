import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabBricksSelectOptionsComponent} from './lab-bricks-select-options.component';

describe('LabBricksSelectOptionsComponent', () => {
  let component: LabBricksSelectOptionsComponent;
  let fixture: ComponentFixture<LabBricksSelectOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabBricksSelectOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabBricksSelectOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
