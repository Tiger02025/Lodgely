import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  getInfo() {
    return {
      name: 'Lodgely API',
      description: 'Student Accommodation Booking Platform API',
      version: '1.0.0',
      documentation: '/api/docs',
      health: '/health',
    };
  }
}
