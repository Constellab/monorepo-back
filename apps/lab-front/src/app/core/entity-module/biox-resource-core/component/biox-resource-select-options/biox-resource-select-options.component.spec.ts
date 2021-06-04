import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxResourceSelectOptionsComponent} from './biox-resource-select-options.component';

describe('BioxResourceSelectOptionComponent', () => {
  let component: BioxResourceSelectOptionsComponent;
  let fixture: ComponentFixture<BioxResourceSelectOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxResourceSelectOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxResourceSelectOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
