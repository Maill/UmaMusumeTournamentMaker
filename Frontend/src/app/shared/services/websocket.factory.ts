import { Injectable } from '@angular/core';
import type { WebSocketService } from './websocket.service';

@Injectable({
  providedIn: 'root'
})
export class WebSocketFactory {
  private webSocketService: WebSocketService | null = null;

  async getWebSocketService(): Promise<WebSocketService> {
    if (!this.webSocketService) {
      const { WebSocketService } = await import('./websocket.service');
      this.webSocketService = new WebSocketService();
    }
    return this.webSocketService;
  }
}