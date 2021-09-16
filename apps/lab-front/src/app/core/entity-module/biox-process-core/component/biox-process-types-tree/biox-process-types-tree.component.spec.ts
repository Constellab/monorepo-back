import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxProcessTypesTreeComponent} from './biox-process-types-tree.component';

describe('BioxProcessTypesTreeComponent', () => {
  let component: BioxProcessTypesTreeComponent;
  let fixture: ComponentFixture<BioxProcessTypesTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxProcessTypesTreeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxProcessTypesTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
