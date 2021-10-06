import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxResourceViewSpecsComponent} from './biox-resource-view-specs.component';

describe('BioxResourceToolbarComponent', () => {
  let component: BioxResourceViewSpecsComponent;
  let fixture: ComponentFixture<BioxResourceViewSpecsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxResourceViewSpecsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxResourceViewSpecsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
