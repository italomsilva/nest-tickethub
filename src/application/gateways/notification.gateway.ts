export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>; // Dados customizados para navegação de rotas no Flutter
}

export interface INotificationGateway {
  sendToUser(userId: string, payload: NotificationPayload): Promise<void>;
  sendToDepartment(departmentId: string, payload: NotificationPayload): Promise<void>;
}
