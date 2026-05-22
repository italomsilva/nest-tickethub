# 🎫 TicketHub — Manual de Documentação Técnica e Arquitetural
O TicketHub é uma plataforma corporativa de Helpdesk e Service Desk desenvolvida para centralizar, auditar e otimizar o fluxo de suporte interno de uma organização. O sistema converte solicitações informais em processos estruturados, garantindo rastreabilidade, cumprimento de prazos e transparência entre os setores colaboradores e as equipes de atendimento.

## 🏛️ 1. Padrão Arquitetural
O sistema foi desenhado seguindo os princípios da Clean Architecture (Arquitetura Limpa). Essa abordagem separa as regras de negócio das tecnologias de infraestrutura (frameworks, bancos de dados e APIs externas), garantindo que o núcleo da aplicação seja altamente testável através de TDD (Test-Driven Development) e imune a mudanças tecnológicas de mercado.

Fluxo de Dependência (Regra de Ouro)
O código das camadas internas nunca deve conhecer ou depender do código das camadas externas. A comunicação cruzada é feita estritamente por meio de interfaces (abstrações).

```mermaid
 ┌─────────────────────────────────────────────────────────┐
 │ Camada 4: INFRAESTRUTURA (NestJS, Repositories, TypeORM)│
 │   ┌─────────────────────────────────────────────────┐   │
 │   │ Camada 3: INTERFACE ADAPTERS (Controllers, DTOs)│   │
 │   │   ┌─────────────────────────────────────────┐   │   │
 │   │   │ Camada 2: APLICAÇÃO (Use Cases, Gates)  │   │   │
 │   │   │   ┌─────────────────────────────────┐   │   │   │
 │   │   │   │ Camada 1: DOMÍNIO (Entities)    │   │   │   │
 │   │   │   └─────────────────────────────────┘   │   │   │
 │   │   └─────────────────────────────────────────┘   │   │
 │   └─────────────────────────────────────────────────┘   │
 └─────────────────────────────────────────────────────────┘
 ```
## 📂 2. Estrutura de Pastas do Projeto
A organização de diretórios no NestJS reflete o isolamento das quatro camadas da arquitetura:

```
src/
├── domain/                         # Camada 1: Regras de Negócio Puras (Enterprise)
│   ├── entities/                   # Entidades de Domínio (ex: ticket.entity.ts)
│   ├── enums/                      # Enums Globais (ex: ticket-status.enum.ts)
│   └── exceptions/                 # Erros de Negócio Puros (ex: justification-required.exception.ts)
│
├── application/                    # Camada 2: Lógica da Aplicação (Application Use Cases)
│   ├── use-cases/                  # Casos de Uso (ex: create-ticket.use-case.ts)
│   │   └── dtos/                   # Inputs/Outputs puramente TypeScript dos Casos de Uso
│   └── repositories/               # Interfaces/Contratos dos Repositórios (ITicketsRepository.ts)
│
├── interface/                      # Camada 3: Adaptadores de Entrada/Saída
│   ├── controllers/                # Controladores HTTP do NestJS
│   │   └── dtos/                   # DTOs de validação HTTP (class-validator)
│   └── presenters/                 # Formatadores de saída de dados (ViewModels)
│
├── infrastructure/                 # Camada 4: Detalhes Técnicos e Frameworks
│   ├── database/                   # Implementações reais dos repositórios (TypeORM/Mongoose)
│   │   └── schemas/                # Modelos/Schemas físicos do banco de dados
│   ├── http/
│   │   ├── filters/                # Global Exception Filters (Tradução de erros para HTTP)
│   │   └── guards/                 # Autenticação e Autorização (JWT / Roles)
│   └── nest/                       # Módulos e configurações globais do NestJS
│
└── main.ts                         # Inicialização do Servidor
```

## ⚙️ 3. Lógica de Negócio e Estados do Chamado
A engrenagem principal do TicketHub é o ciclo de vida de um ticket, mapeado estritamente através do enum string TicketStatus:
```typescript
export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REOPENED = 'REOPENED',
  INCONSISTENT = 'INCONSISTENT'
}
```

O Fluxo de Estados
```mermaid
[ OPEN ] ➔ [ IN_PROGRESS ] ➔ [ RESOLVED ] ➔ [ CLOSED ]
                  │                     │
                  └───────➔ [ INCONSISTENT ] (Rejeitado pelo Técnico)
                                    │
                                    └───➔ [ REOPENED ]
```

### Regras de Transição e Validação Fundamentais:
- Inicialização: Todo chamado nasce obrigatoriamente com o status OPEN.

- Triagem: Um agente de suporte vinculado ao setor de destino altera o status para IN_PROGRESS ao assumir a demanda.

- A Regra Crítica de Inconsistência (INCONSISTENT): Se o setor destino analisar o chamado e constatar que ele está duplicado, sem nexo, mal descrito ou antigo e irrelevante, o agente pode movê-lo para INCONSISTENT.

- Regra de Ouro: A transição para INCONSISTENT exige obrigatoriamente uma justificativa em texto. Se omitida, a aplicação barra o fluxo.

- Resolução e Encerramento: Após a resolução técnica, o status vai para RESOLVED. O cliente que abriu o chamado possui a palavra final: ele pode mover para CLOSED (concluindo o fluxo) ou REOPENED (caso o problema persista), fazendo o ticket retornar para a fila.

## 🛑 4. Estratégia de Gerenciamento de Erros (Exceptions)
Para manter o desacoplamento, o sistema não utiliza erros HTTP (como HttpException do NestJS) dentro do Domínio ou da Aplicação.

Camada de Domínio/Aplicação: Lança erros nativos TypeScript que herdam da classe genérica Error.


```typescript
export class JustificationRequiredException extends Error {
  constructor() {
    super('A text justification is required when marking a ticket as INCONSISTENT.');
    this.name = 'JustificationRequiredException';
  }
}
```

2. **Camada de Infraestrutura (DomainExceptionFilter):** Um filtro global do NestJS intercepta os erros de negócio que estouram dos controladores e os traduz nos códigos de status HTTP corretos antes de responder ao cliente:
   * JustificationRequiredException ➔ 400 Bad Request
   * TicketNotFoundException ➔ 404 Not Found
   * Erros inesperados de banco/infraestrutura ➔ 500 Internal Server Error

---

## 🔄 5. Fluxo de Dados e Separação de DTOs

O fluxo de dados impede o acoplamento do framework nas camadas internas utilizando objetos distintos para transporte e validação:

1. **Entrada do Request:** O HTTP Request atinge o controlador contendo um ControllerDto decorado com class-validator para validações sintáticas superficiais (ex: @IsString()).
2. **Mapeamento (Input):** O controlador extrai os dados do ControllerDto, anexa metadados do contexto de segurança (como o ID do usuário extraído do Token JWT) e monta uma interface simples de UseCaseInput (TypeScript puro).
3. **Processamento:** O Caso de Uso recebe o UseCaseInput e executa as validações de regras de negócio.
4. **Saída do Response:** O Caso de Uso retorna uma Entidade de Domínio limpa. O controlador recebe essa entidade e a envia para um Presenter (ex: TicketPresenter.toHTTP(ticket)), que filtra propriedades sensíveis e devolve o JSON final ao usuário.

---

## 🌐 6. Catálogo de Endpoints da API (REST)

### 🔑 Autenticação e Perfis (/auth e /users)
| Método | Endpoint | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| POST | /auth/login | Público | Autentica o usuário e retorna o Token JWT. |
| POST | /users | ADMIN | Cadastra novos usuários e atribui seus perfis (Client, Agent, Admin). |
| GET | /users/me | Autenticado | Retorna os dados do perfil do usuário logado. |

### 🎫 Gestão de Tickets (/tickets)
| Método | Endpoint | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| POST | /tickets | CLIENT | **Abertura de Chamado.** Recebe title, description, departmentId e um arquivo opcional de photo (multipart/form-data). Define o status como OPEN. |
| GET | /tickets | Autenticado | **Listagem dinâmica.** Clientes visualizam apenas seus chamados; Agentes visualizam a fila do seu setor; Admins visualizam tudo. |
| GET | /tickets/:id | Autenticado | Retorna os detalhes completos de um ticket e seu histórico de auditoria. |
| PATCH| /tickets/:id/assign| AGENT | **Assumir Chamado.** Altera o status de OPEN para IN_PROGRESS e vincula o técnico logado ao chamado. |
| PATCH| /tickets/:id/resolve| AGENT | **Marcar como Resolvido.** Altera o status para RESOLVED. Requer a descrição da solução no corpo da requisição. |
| PATCH| /tickets/:id/status | Autenticado | **Transições Específicas.** Modifica o status para CLOSED, REOPENED ou INCONSISTENT. <br> *Se status === 'INCONSISTENT', o campo justification torna-se obrigatório no payload.* |

### 💬 Linha do Tempo e Interação (/tickets/:ticketId/comments)
| Método | Endpoint | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| POST | /tickets/:id/comments| Autenticado | Insere uma mensagem de texto no chat do ticket para comunicação direta entre cliente e técnico. |
| GET | /tickets/:id/comments| Autenticado | Retorna a linha do tempo cronológica com a conversa daquele chamado. |

### 🏢 Estrutura Corporativa (/departments)
| Método | Endpoint | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| GET | /departments | Autenticado | Lista todos os setores ativos (TI, RH, Infraestrutura) para popular o formulário de abertura de chamados. |
| POST | /departments | ADMIN | Cria e registra um novo setor organizacional no sistema. |

---

## 🔒 7. Políticas de Segurança e Logs de Auditoria

* **Imutabilidade do Histórico:** Toda e qualquer alteração de status (oldStatus para newStatus) ou alteração de técnico responsável dispara obrigatoriamente a escrita em uma tabela/coleção de log de auditoria (AuditLog). Esse registro armazena o userId do autor, o carimbo de data/hora (timestamp) e o evento ocorrido, sendo impossível de ser deletado ou alterado via API.
* **Isolamento de Setores:** Agentes de suporte têm visibilidade restrita aos chamados direcionados para o seu respectivo se