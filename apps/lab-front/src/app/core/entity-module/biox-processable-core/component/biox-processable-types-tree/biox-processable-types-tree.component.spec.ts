import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxProcessableTypesTreeComponent} from './biox-processable-types-tree.component';

describe('BioxProcessableTypesTreeComponent', () => {
  let component: BioxProcessableTypesTreeComponent;
  let fixture: ComponentFixture<BioxProcessableTypesTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxProcessableTypesTreeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxProcessableTypesTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
