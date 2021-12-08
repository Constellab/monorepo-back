import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxTransformResourceComponent} from './biox-transform-resource.component';

describe('BioxTransformResourceComponent', () => {
  let component: BioxTransformResourceComponent;
  let fixture: ComponentFixture<BioxTransformResourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxTransformResourceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxTransformResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
