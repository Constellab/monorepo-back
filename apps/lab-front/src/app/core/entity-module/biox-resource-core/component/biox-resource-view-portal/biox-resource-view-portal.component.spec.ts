import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxResourceViewPortalComponent} from './biox-resource-view-portal.component';

describe('BioxResourcePortalViewComponent', () => {
  let component: BioxResourceViewPortalComponent;
  let fixture: ComponentFixture<BioxResourceViewPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxResourceViewPortalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxResourceViewPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
