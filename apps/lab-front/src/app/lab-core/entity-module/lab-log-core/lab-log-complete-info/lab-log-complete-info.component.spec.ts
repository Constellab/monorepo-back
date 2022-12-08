import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabLogCompleteInfoComponent} from './lab-log-complete-info.component';

describe('LabLogCompleteInfoComponent', () => {
  let component: LabLogCompleteInfoComponent;
  let fixture: ComponentFixture<LabLogCompleteInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabLogCompleteInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabLogCompleteInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
