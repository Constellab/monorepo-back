import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxProcessableSpecsTreeComponent} from './biox-processable-specs-tree.component';

describe('BioxProcessableTypesTreeComponent', () => {
  let component: BioxProcessableSpecsTreeComponent;
  let fixture: ComponentFixture<BioxProcessableSpecsTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxProcessableSpecsTreeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxProcessableSpecsTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
