import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabTypeDetailComponent} from './lab-type-detail.component';

describe('BioxProcessTypeCardComponent', () => {
  let component: LabTypeDetailComponent;
  let fixture: ComponentFixture<LabTypeDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabTypeDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabTypeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
