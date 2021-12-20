import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceTextComponent} from './lab-resource-text.component';

describe('BioxResourceTextComponent', () => {
  let component: LabResourceTextComponent;
  let fixture: ComponentFixture<LabResourceTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceTextComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourceTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
