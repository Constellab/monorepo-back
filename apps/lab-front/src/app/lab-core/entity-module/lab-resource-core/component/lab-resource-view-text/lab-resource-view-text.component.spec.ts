import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceViewTextComponent} from './lab-resource-view-text.component';

describe('BioxResourceTextComponent', () => {
  let component: LabResourceViewTextComponent;
  let fixture: ComponentFixture<LabResourceViewTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceViewTextComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourceViewTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
