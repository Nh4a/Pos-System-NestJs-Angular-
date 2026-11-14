import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PosService } from './features/pos/services/pos.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  public posService = inject(PosService);
  protected readonly title = signal('SupaPOS');

  // Live Date & Time
  protected readonly currentDateStr = signal('');
  protected readonly currentTimeStr = signal('');
  private timeTimer: any;

  // Mobile navigation drawer state
  public isMobileMenuOpen = signal(false);

  ngOnInit() {
    this.updateClock();
    this.timeTimer = setInterval(() => this.updateClock(), 1000);
  }

  ngOnDestroy() {
    if (this.timeTimer) {
      clearInterval(this.timeTimer);
    }
  }

  private updateClock() {
    const now = new Date();
    // Format date: Wednesday, July 2, 2025
    this.currentDateStr.set(
      now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    );
    // Format time: 15:55:16
    this.currentTimeStr.set(
      now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    );
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }
}
