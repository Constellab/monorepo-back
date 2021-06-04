import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxResourceTypeSelectOptionsComponent} from './biox-resource-type-select-options.component';

describe('BioxResourceTypeSelectOptionsComponent', () => {
  let component: BioxResourceTypeSelectOptionsComponent;
  let fixture: ComponentFixture<BioxResourceTypeSelectOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxResourceTypeSelectOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxResourceTypeSelectOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
