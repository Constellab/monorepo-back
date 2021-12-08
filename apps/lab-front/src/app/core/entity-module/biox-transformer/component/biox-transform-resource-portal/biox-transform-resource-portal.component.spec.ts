import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxTransformResourcePortalComponent} from './biox-transform-resource-portal.component';

describe('BioxTransformResourceDialogComponent', () => {
  let component: BioxTransformResourcePortalComponent;
  let fixture: ComponentFixture<BioxTransformResourcePortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxTransformResourcePortalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxTransformResourcePortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
