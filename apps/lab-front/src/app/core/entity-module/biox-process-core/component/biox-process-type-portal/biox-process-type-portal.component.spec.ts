import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxProcessTypePortalComponent} from './biox-process-type-portal.component';

describe('BioxProcessTypePortalComponent', () => {
  let component: BioxProcessTypePortalComponent;
  let fixture: ComponentFixture<BioxProcessTypePortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxProcessTypePortalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxProcessTypePortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
