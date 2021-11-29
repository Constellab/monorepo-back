import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxResourceOriginOptionsComponent } from './biox-resource-origin-options.component';

describe('BioxResourceOriginOptionsComponent', () => {
  let component: BioxResourceOriginOptionsComponent;
  let fixture: ComponentFixture<BioxResourceOriginOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxResourceOriginOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxResourceOriginOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
