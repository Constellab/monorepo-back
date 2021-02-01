import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxConfigureSpecsComponent } from './biox-configure-specs.component';

describe('BioxConfigureSpecComponent', () => {
  let component: BioxConfigureSpecsComponent;
  let fixture: ComponentFixture<BioxConfigureSpecsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxConfigureSpecsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxConfigureSpecsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
