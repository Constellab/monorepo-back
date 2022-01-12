import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabTypeSearchComponent} from './lab-type-search.component';

describe('LabTypeSearchComponent', () => {
  let component: LabTypeSearchComponent;
  let fixture: ComponentFixture<LabTypeSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabTypeSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabTypeSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
