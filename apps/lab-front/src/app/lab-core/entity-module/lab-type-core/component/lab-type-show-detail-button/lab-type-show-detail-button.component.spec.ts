import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabTypeShowDetailButtonComponent} from './lab-type-show-detail-button.component';

describe('LabProcessTypeShowDetailButtonComponent', () => {
  let component: LabTypeShowDetailButtonComponent;
  let fixture: ComponentFixture<LabTypeShowDetailButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabTypeShowDetailButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabTypeShowDetailButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
