export interface HealthRepository {
  checkHealth(): Promise<{
    status: string;
    uptime: number;
    timestamp: string;
  }>;

  testSmtpConnection(email: string, message: string): Promise<{
    status: string;
    service: string;
    message: string;
    emailSent: boolean;
    recipient: string;
    timestamp: string;
  }>;
}

export const HEALTH_REPOSITORY = Symbol('HealthRepository');
