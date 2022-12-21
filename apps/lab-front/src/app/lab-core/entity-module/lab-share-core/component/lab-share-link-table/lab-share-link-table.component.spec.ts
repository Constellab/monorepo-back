import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabShareLinkTableComponent} from './lab-share-link-table.component';

describe('LabShareLinkTableComponent', () => {
  let component: LabShareLinkTableComponent;
  let fixture: ComponentFixture<LabShareLinkTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabShareLinkTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabShareLinkTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
