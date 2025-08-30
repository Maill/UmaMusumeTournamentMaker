import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
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
  imports: [CommonModule],
  template: `
    <span [class]="getIconClasses()" [attr.aria-label]="ariaLabel" [innerHTML]="getIconSvg()">
    </span>
  `,
  styleUrl: './base-icon.component.css',
})
export class BaseIconComponent {
  @Input() name: IconName = 'info';
  @Input() size: IconSize = 'md';
  @Input() color: string = '';
  @Input() ariaLabel: string = '';

  constructor(private sanitizer: DomSanitizer) {}

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

  getIconSvg(): SafeHtml {
    const svg = this.icons[this.name] || this.icons.info;
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  getIconClasses(): string {
    const classes = ['icon', `icon-${this.size}`];

    if (this.color) {
      classes.push(`icon-${this.color}`);
    }

    return classes.join(' ');
  }
}
