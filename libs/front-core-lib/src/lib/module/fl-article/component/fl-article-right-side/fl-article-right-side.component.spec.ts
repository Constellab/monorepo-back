import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlArticleRightSideComponent} from './fl-article-right-side.component';

describe('FlArticleRightSideComponent', () => {
  let component: FlArticleRightSideComponent;
  let fixture: ComponentFixture<FlArticleRightSideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlArticleRightSideComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlArticleRightSideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
