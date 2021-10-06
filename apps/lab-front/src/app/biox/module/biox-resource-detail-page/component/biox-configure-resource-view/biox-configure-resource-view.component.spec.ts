import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxConfigureResourceViewComponent} from './biox-configure-resource-view.component';

describe('BioxConfigureResourceViewComponent', () => {
  let component: BioxConfigureResourceViewComponent;
  let fixture: ComponentFixture<BioxConfigureResourceViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxConfigureResourceViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxConfigureResourceViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
