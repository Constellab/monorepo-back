import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxResourceMultiViewComponent} from './biox-resource-multi-view.component';

describe('BioxResourceMultiViewComponent', () => {
  let component: BioxResourceMultiViewComponent;
  let fixture: ComponentFixture<BioxResourceMultiViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxResourceMultiViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxResourceMultiViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
