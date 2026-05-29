import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class PostgresService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PostgresService.name);
  private pool: Pool;

  async onModuleInit() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    this.logger.log('PostgreSQL database pool initialized.');
    
    try {
      await this.initializeDatabase();
    } catch (err) {
      this.logger.error('================================================================');
      this.logger.error('⚠️ ALERTA: Não foi possível conectar ao banco PostgreSQL!');
      this.logger.error('O NestJS iniciou, mas as operações de banco falharão.');
      this.logger.error('Para resolver, certifique-se de que o Postgres está rodando.');
      this.logger.error('Execute o comando abaixo em outro terminal para subir o banco:');
      this.logger.error('   docker compose up -d postgres');
      this.logger.error('================================================================');
    }
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
      this.logger.log('PostgreSQL database pool closed.');
    }
  }

  // Expose the raw pool for repository use
  getPool(): Pool {
    return this.pool;
  }

  private async initializeDatabase() {
    // 1. Create Departments table
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        details TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Create Users table
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        department_id VARCHAR(255) REFERENCES departments(id) ON DELETE SET NULL,
        phone VARCHAR(50),
        profile_image TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Create Tickets table
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        attachment_url TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
        client_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        agent_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
        target_department_id VARCHAR(255) NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Create Comments table
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id VARCHAR(255) PRIMARY KEY,
        ticket_id VARCHAR(255) NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Create Ticket Audit Logs table
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS ticket_audit_logs (
        id VARCHAR(255) PRIMARY KEY,
        ticket_id VARCHAR(255) NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        old_status VARCHAR(50),
        new_status VARCHAR(50) NOT NULL,
        justification TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    this.logger.log('PostgreSQL schema initialized successfully.');
    await this.seed();
  }

  private async seed() {
    // Seed departments if empty
    const deptCountRes = await this.pool.query('SELECT COUNT(*) FROM departments');
    if (parseInt(deptCountRes.rows[0].count, 10) === 0) {
      this.logger.log('Seeding initial departments...');
      await this.pool.query(`
        INSERT INTO departments (id, name, details, created_at) VALUES
        ('IT-DEPT', 'TI', 'Tecnologia da Informacao', NOW()),
        ('RH-DEPT', 'RH', 'Recursos Humanos', NOW());
      `);
    }

    // Seed users if empty
    const userCountRes = await this.pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCountRes.rows[0].count, 10) === 0) {
      this.logger.log('Seeding initial users...');
      await this.pool.query(`
        INSERT INTO users (id, name, email, password_hash, role, department_id, created_at) VALUES
        ('client-1', 'Client User', 'client@corporativo.com', '$2b$10$HjF0teKjcMRHDDMi/GQ8PeqESzdltpX49PEzMU/gSjyKhSRN5c88S', 'CLIENT', NULL, NOW()),
        ('agent-1', 'Agent TI', 'agent-ti@corporativo.com', '$2b$10$HjF0teKjcMRHDDMi/GQ8PeqESzdltpX49PEzMU/gSjyKhSRN5c88S', 'AGENT', 'IT-DEPT', NOW()),
        ('agent-2', 'Agent RH', 'agent-rh@corporativo.com', '$2b$10$HjF0teKjcMRHDDMi/GQ8PeqESzdltpX49PEzMU/gSjyKhSRN5c88S', 'AGENT', 'RH-DEPT', NOW()),
        ('admin-1', 'Admin User', 'admin@corporativo.com', '$2b$10$HjF0teKjcMRHDDMi/GQ8PeqESzdltpX49PEzMU/gSjyKhSRN5c88S', 'ADMIN', NULL, NOW());
      `);
    }

    this.logger.log('PostgreSQL database seeded successfully.');
  }
}
