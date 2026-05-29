import { Injectable, Logger } from '@nestjs/common';
import { INotificationGateway, NotificationPayload } from '../../application/gateways/notification.gateway';

@Injectable()
export class HybridNotificationGateway implements INotificationGateway {
  private readonly logger = new Logger('NotificationGateway');

  async sendToUser(userId: string, payload: NotificationPayload): Promise<void> {
    this.logger.log(
      `[Notification sent to User ID: ${userId}] ` +
      `Title: "${payload.title}" | Body: "${payload.body}" | Data: ${JSON.stringify(payload.data || {})}`
    );
  }

  async sendToDepartment(departmentId: string, payload: NotificationPayload): Promise<void> {
    this.logger.log(
      `[Notification sent to Department ID: ${departmentId}] ` +
      `Title: "${payload.title}" | Body: "${payload.body}" | Data: ${JSON.stringify(payload.data || {})}`
    );
  }
}
