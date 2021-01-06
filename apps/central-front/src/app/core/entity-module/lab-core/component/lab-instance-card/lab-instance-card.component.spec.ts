import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabInstanceCardComponent} from './lab-instance-card.component';

describe('LabInstanceCardComponent', () => {
  let component: LabInstanceCardComponent;
  let fixture: ComponentFixture<LabInstanceCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabInstanceCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabInstanceCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
