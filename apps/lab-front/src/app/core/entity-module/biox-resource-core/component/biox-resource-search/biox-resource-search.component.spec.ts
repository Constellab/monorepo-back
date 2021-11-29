import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxResourceSearchComponent } from './biox-resource-search.component';

describe('BioxResourceSearchComponent', () => {
  let component: BioxResourceSearchComponent;
  let fixture: ComponentFixture<BioxResourceSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxResourceSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxResourceSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
