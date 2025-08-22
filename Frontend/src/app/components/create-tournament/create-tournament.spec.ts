import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTournament } from './create-tournament';

describe('CreateTournament', () => {
  let component: CreateTournament;
  let fixture: ComponentFixture<CreateTournament>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTournament]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateTournament);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
