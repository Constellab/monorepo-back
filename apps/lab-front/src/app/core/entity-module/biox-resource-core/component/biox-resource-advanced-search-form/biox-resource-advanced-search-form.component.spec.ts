import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxResourceAdvancedSearchFormComponent } from './biox-resource-advanced-search-form.component';

describe('BioxResourceAdvancedSearchFormComponent', () => {
  let component: BioxResourceAdvancedSearchFormComponent;
  let fixture: ComponentFixture<BioxResourceAdvancedSearchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxResourceAdvancedSearchFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxResourceAdvancedSearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
