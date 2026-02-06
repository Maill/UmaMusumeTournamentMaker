import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export type IconName =
  | 'trophy'
  | 'close'
  | 'edit'
  | 'delete'
  | 'add'
  | 'check'
  | 'warning'
  | 'info'
  | 'refresh'
  | 'eye'
  | 'eye-slash'
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-right'
  | 'star'
  | 'medal-first'
  | 'medal-second'
  | 'medal-thrid'
  | 'users'
  | 'target'
  | 'calendar'
  | 'clock'
  | 'play'
  | 'trending-up'
  | 'arrow-left'
  | 'lightbulb'
  | 'cog'
  | 'confetti'
  | 'podium';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [],
  template: `
    <span [class]="iconClasses()" [attr.aria-label]="ariaLabel()" [innerHTML]="iconSvg()">
    </span>
  `,
  styleUrl: './base-icon.component.css',
})
export class BaseIconComponent {
  readonly name = input<IconName>('info');
  readonly size = input<IconSize>('md');
  readonly color = input<string>('');
  readonly ariaLabel = input<string>('');

  private sanitizer: DomSanitizer = inject(DomSanitizer);

  private icons: Record<IconName, string> = {
    trophy: `🏆`,
    close: `❌`,
    edit: `✏️`,
    delete: `🗑️`,
    add: `➕`,
    check: `✅`,
    warning: `⚠️`,
    info: `ℹ️`,
    refresh: `🔄`,
    eye: `👁️`,
    'eye-slash': `🙈`,
    'chevron-down': `⬇️`,
    'chevron-up': `⬆️`,
    'chevron-right': `➡️`,
    star: `⭐`,
    'medal-first': `🥇`,
    'medal-second': `🥈`,
    'medal-thrid': `🥉`,
    users: `👥`,
    target: `🎯`,
    calendar: `📅`,
    clock: `🕐`,
    play: `▶️`,
    'trending-up': `📈`,
    'arrow-left': `⬅️`,
    lightbulb: `💡`,
    cog: `⚙️`,
    confetti: `🎉`,
    podium: `🏅`,
  };

  readonly iconSvg = computed<SafeHtml>(() => {
    const svg = this.icons[this.name()] || this.icons.info;
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  });

  readonly iconClasses = computed(() => {
    const classes = ['icon', `icon-${this.size()}`];
    if (this.color()) {
      classes.push(`icon-${this.color()}`);
    }
    return classes.join(' ');
  });
}
