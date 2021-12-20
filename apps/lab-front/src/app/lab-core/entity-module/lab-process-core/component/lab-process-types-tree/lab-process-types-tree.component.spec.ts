import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabProcessTypesTreeComponent} from './lab-process-types-tree.component';

describe('BioxProcessTypesTreeComponent', () => {
  let component: LabProcessTypesTreeComponent;
  let fixture: ComponentFixture<LabProcessTypesTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabProcessTypesTreeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabProcessTypesTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
