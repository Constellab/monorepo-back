import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceJsonComponent} from './lab-resource-json.component';

describe('BioxResourceJsonComponent', () => {
  let component: LabResourceJsonComponent;
  let fixture: ComponentFixture<LabResourceJsonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceJsonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourceJsonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
