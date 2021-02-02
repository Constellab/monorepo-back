import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxResourcePortalComponent } from './biox-resource-portal.component';

describe('BioxResourceDialogComponent', () => {
  let component: BioxResourcePortalComponent;
  let fixture: ComponentFixture<BioxResourcePortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxResourcePortalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxResourcePortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
