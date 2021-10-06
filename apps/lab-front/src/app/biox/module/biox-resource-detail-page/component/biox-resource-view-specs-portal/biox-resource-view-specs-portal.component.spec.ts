import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxResourceViewSpecsPortalComponent} from './biox-resource-view-specs-portal.component';

describe('BioxResourceViewsPortalComponent', () => {
  let component: BioxResourceViewSpecsPortalComponent;
  let fixture: ComponentFixture<BioxResourceViewSpecsPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxResourceViewSpecsPortalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxResourceViewSpecsPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
