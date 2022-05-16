import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabConfigureProcessComponent} from './lab-configure-process.component';

describe('LabConfigureProcessComponent', () => {
  let component: LabConfigureProcessComponent;
  let fixture: ComponentFixture<LabConfigureProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabConfigureProcessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabConfigureProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
