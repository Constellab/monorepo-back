import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxShowConfigPortalComponent } from './biox-show-config-portal.component';

describe('BioxShowConfigDialogComponent', () => {
  let component: BioxShowConfigPortalComponent;
  let fixture: ComponentFixture<BioxShowConfigPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxShowConfigPortalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxShowConfigPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
