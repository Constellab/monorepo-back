import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TdTechDocLinkComponent} from './td-tech-doc-link.component';

describe('TdTechDocLinkComponent', () => {
  let component: TdTechDocLinkComponent;
  let fixture: ComponentFixture<TdTechDocLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TdTechDocLinkComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TdTechDocLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
