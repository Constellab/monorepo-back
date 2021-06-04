import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxResourceSelectComponent} from './biox-resource-select.component';

describe('BioxResourceSelectComponent', () => {
  let component: BioxResourceSelectComponent;
  let fixture: ComponentFixture<BioxResourceSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxResourceSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxResourceSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
