import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxResourceSearchPageComponent } from './biox-resource-search-page.component';

describe('BioxResourceSearchPageComponent', () => {
  let component: BioxResourceSearchPageComponent;
  let fixture: ComponentFixture<BioxResourceSearchPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxResourceSearchPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxResourceSearchPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
