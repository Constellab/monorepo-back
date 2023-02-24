import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabProgressMessageComponent} from './lab-progress-message.component';

describe('LabProgressMessageComponent', () => {
  let component: LabProgressMessageComponent;
  let fixture: ComponentFixture<LabProgressMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabProgressMessageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabProgressMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
