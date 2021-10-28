import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxResourceViewComponent} from './biox-resource-view.component';

describe('BioxResourceViewComponent', () => {
  let component: BioxResourceViewComponent;
  let fixture: ComponentFixture<BioxResourceViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxResourceViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxResourceViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
