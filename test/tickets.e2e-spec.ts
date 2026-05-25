import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { TicketStatus } from '../src/tickets/tickets.service';

describe('Tickets Module Workflow (e2e)', () => {
  let app: INestApplication<App>;

  // Simulated authentication headers mapping to user context roles
  const AUTH_HEADERS = {
    CLIENT: 'Bearer client-jwt-token',
    AGENT_TI: 'Bearer agent-ti-jwt-token',
    AGENT_RH: 'Bearer agent-rh-jwt-token',
    ADMIN: 'Bearer admin-jwt-token',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Full Helpdesk Ticket Lifecycle Integration', () => {
    let ticketId: string;

    it('should successfully allow CLIENT to open a support ticket with an optional attachment', async () => {
      const response = await request(app.getHttpServer() as any)
        .post('/tickets')
        .set('Authorization', AUTH_HEADERS.CLIENT)
        .field('title', 'Laptop sem sinal de Wifi')
        .field('description', 'O adaptador de rede sumiu do gerenciador de dispositivos.')
        .field('departmentId', 'IT-DEPT')
        .attach('photo', Buffer.from('dummy-image-data'), 'net.png')
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe(TicketStatus.OPEN);
      expect(response.body.attachmentUrl).toBeDefined();
      
      ticketId = response.body.id;
    });

    it('should reject ticket creation with 403 Forbidden if requester is an AGENT', async () => {
      await request(app.getHttpServer() as any)
        .post('/tickets')
        .set('Authorization', AUTH_HEADERS.AGENT_TI)
        .send({
          title: 'Abertura inválida',
          description: 'Tentando abrir como agente',
          departmentId: 'IT-DEPT',
        })
        .expect(403);
    });

    it('should correctly isolate tickets by role when listing via GET /tickets', async () => {
      // 1. CLIENT sees only their owned tickets
      const clientRes = await request(app.getHttpServer() as any)
        .get('/tickets')
        .set('Authorization', AUTH_HEADERS.CLIENT)
        .expect(200);
      
      expect(Array.isArray(clientRes.body)).toBe(true);
      expect(clientRes.body.every((t: any) => t.clientId === 'client-1')).toBe(true);

      // 2. AGENT sees only tickets directed to their department
      const agentRes = await request(app.getHttpServer() as any)
        .get('/tickets')
        .set('Authorization', AUTH_HEADERS.AGENT_TI)
        .expect(200);

      expect(Array.isArray(agentRes.body)).toBe(true);
      expect(agentRes.body.every((t: any) => t.targetDepartmentId === 'IT-DEPT')).toBe(true);

      // 3. ADMIN sees all tickets globally
      const adminRes = await request(app.getHttpServer() as any)
        .get('/tickets')
        .set('Authorization', AUTH_HEADERS.ADMIN)
        .expect(200);

      expect(Array.isArray(adminRes.body)).toBe(true);
    });

    it('should transition ticket to IN_PROGRESS and assign ticket to current technician', async () => {
      const response = await request(app.getHttpServer() as any)
        .patch(`/tickets/${ticketId}/assign`)
        .set('Authorization', AUTH_HEADERS.AGENT_TI)
        .expect(200);

      expect(response.body.status).toBe(TicketStatus.IN_PROGRESS);
      expect(response.body.agentId).toBeDefined();
    });

    it('should reject interactions with 403 Forbidden from AGENTs outside of the target department', async () => {
      await request(app.getHttpServer() as any)
        .patch(`/tickets/${ticketId}/assign`)
        .set('Authorization', AUTH_HEADERS.AGENT_RH)
        .expect(403);
    });

    it('should enforce justification when transition status to INCONSISTENT is triggered', async () => {
      // Missing justification body -> 400 Bad Request
      await request(app.getHttpServer() as any)
        .patch(`/tickets/${ticketId}/status`)
        .set('Authorization', AUTH_HEADERS.AGENT_TI)
        .send({ status: TicketStatus.INCONSISTENT })
        .expect(400);

      // Success with justification body -> 200 OK
      const res = await request(app.getHttpServer() as any)
        .patch(`/tickets/${ticketId}/status`)
        .set('Authorization', AUTH_HEADERS.AGENT_TI)
        .send({
          status: TicketStatus.INCONSISTENT,
          justification: 'Equipamento não pertence a este setor organizacional.',
        })
        .expect(200);

      expect(res.body.status).toBe(TicketStatus.INCONSISTENT);
    });

    it('should record comments in the ticket chat timeline', async () => {
      // 1. Post a new comment
      const commentRes = await request(app.getHttpServer() as any)
        .post(`/tickets/${ticketId}/comments`)
        .set('Authorization', AUTH_HEADERS.CLIENT)
        .send({ message: 'Enviei o anexo correto no chamado.' })
        .expect(201);

      expect(commentRes.body).toHaveProperty('id');
      expect(commentRes.body.message).toBe('Enviei o anexo correto no chamado.');

      // 2. Fetch the comments list
      const listRes = await request(app.getHttpServer() as any)
        .get(`/tickets/${ticketId}/comments`)
        .set('Authorization', AUTH_HEADERS.AGENT_TI)
        .expect(200);

      expect(Array.isArray(listRes.body)).toBe(true);
      expect(listRes.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should enforce solution description when technical agent resolves the ticket', async () => {
      // Missing solution -> 400 Bad Request
      await request(app.getHttpServer() as any)
        .patch(`/tickets/${ticketId}/resolve`)
        .set('Authorization', AUTH_HEADERS.AGENT_TI)
        .send({ solution: '' })
        .expect(400);

      // With solution -> 200 OK
      const res = await request(app.getHttpServer() as any)
        .patch(`/tickets/${ticketId}/resolve`)
        .set('Authorization', AUTH_HEADERS.AGENT_TI)
        .send({ solution: 'Configurado driver genérico compatível com rede Wifi.' })
        .expect(200);

      expect(res.body.status).toBe(TicketStatus.RESOLVED);
    });

    it('should allow CLIENT to officially close the ticket', async () => {
      const res = await request(app.getHttpServer() as any)
        .patch(`/tickets/${ticketId}/status`)
        .set('Authorization', AUTH_HEADERS.CLIENT)
        .send({ status: TicketStatus.CLOSED })
        .expect(200);

      expect(res.body.status).toBe(TicketStatus.CLOSED);
    });
  });
});
