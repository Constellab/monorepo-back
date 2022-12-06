import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabVenvCompleteInfoComponent} from './lab-venv-complete-info.component';

describe('LabVenvCompleteInfoComponent', () => {
  let component: LabVenvCompleteInfoComponent;
  let fixture: ComponentFixture<LabVenvCompleteInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabVenvCompleteInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabVenvCompleteInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
