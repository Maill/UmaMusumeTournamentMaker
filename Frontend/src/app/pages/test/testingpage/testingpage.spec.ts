import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Testingpage } from './testingpage';

describe('Testingpage', () => {
  let component: Testingpage;
  let fixture: ComponentFixture<Testingpage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Testingpage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Testingpage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
