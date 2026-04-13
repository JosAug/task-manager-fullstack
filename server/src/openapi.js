/** OpenAPI 3.0 — espelha a API REST (JWT Bearer). */

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "API Tarefas",
    description:
      "API própria com **cadastro**, **login** (JWT) e **CRUD de tarefas** por usuário. " +
      "Rotas protegidas exigem `Authorization: Bearer <token>`. " +
      "**Chat em tempo real:** WebSocket em `/socket.io`, autenticação via `auth.token` no handshake (mesmo JWT).",
    version: "1.2.0",
  },
  servers: [{ url: "/", description: "Mesmo host da API (ex.: http://localhost:4000)" }],
  tags: [
    { name: "Sistema", description: "Saúde da API" },
    { name: "Auth", description: "Cadastro, login e sessão (JWT)" },
    { name: "Tarefas", description: "CRUD de tarefas (autenticado)" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Token retornado em `POST /api/auth/register` ou `POST /api/auth/login`.",
      },
    },
    schemas: {
      ValidationError: {
        type: "object",
        properties: {
          error: { type: "string", example: "Dados inválidos" },
          details: {
            type: "array",
            items: {
              type: "object",
              properties: {
                path: { type: "string" },
                message: { type: "string" },
              },
            },
          },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "integer" },
          email: { type: "string", format: "email" },
          name: { type: "string" },
          created_at: { type: "string" },
        },
      },
      Task: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          description: { type: "string", nullable: true },
          completed: { type: "boolean" },
          created_at: { type: "string" },
          updated_at: { type: "string" },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["email", "password", "name"],
        properties: {
          email: { type: "string", format: "email", maxLength: 255 },
          password: { type: "string", minLength: 6, maxLength: 128 },
          name: { type: "string", minLength: 1, maxLength: 100 },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },
      DeleteAccountRequest: {
        type: "object",
        required: ["password"],
        properties: {
          password: { type: "string", description: "Senha atual para confirmar exclusão" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/User" },
          token: { type: "string", description: "JWT" },
        },
      },
      TaskCreate: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string", minLength: 1, maxLength: 200 },
          description: { type: "string", nullable: true, maxLength: 2000 },
        },
      },
      TaskPut: {
        type: "object",
        required: ["title", "completed"],
        properties: {
          title: { type: "string", minLength: 1, maxLength: 200 },
          description: { type: "string", nullable: true, maxLength: 2000 },
          completed: { type: "boolean" },
        },
      },
      TaskPatch: {
        type: "object",
        minProperties: 1,
        properties: {
          title: { type: "string", minLength: 1, maxLength: 200 },
          description: { type: "string", nullable: true, maxLength: 2000 },
          completed: { type: "boolean" },
        },
      },
      TaskListResponse: {
        type: "object",
        properties: {
          tasks: { type: "array", items: { $ref: "#/components/schemas/Task" } },
        },
      },
      TaskResponse: {
        type: "object",
        properties: {
          task: { $ref: "#/components/schemas/Task" },
        },
      },
      ErrorMessage: {
        type: "object",
        properties: { error: { type: "string" } },
      },
    },
  },
  paths: {
    "/api/health": {
      get: {
        tags: ["Sistema"],
        summary: "Health check",
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { ok: { type: "boolean", example: true } },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Cadastro",
        description: "Cria usuário e já retorna JWT.",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RegisterRequest" } },
          },
        },
        responses: {
          201: {
            description: "Criado",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } },
            },
          },
          400: {
            description: "Validação",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } },
            },
          },
          409: {
            description: "E-mail já cadastrado",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ErrorMessage" } },
            },
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } },
          },
        },
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } },
            },
          },
          400: {
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } },
            },
          },
          401: {
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ErrorMessage" } },
            },
          },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Usuário atual",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { user: { $ref: "#/components/schemas/User" } },
                },
              },
            },
          },
          401: { description: "Token ausente ou inválido" },
          404: { description: "Usuário não encontrado" },
        },
      },
    },
    "/api/auth/delete-account": {
      post: {
        tags: ["Auth"],
        summary: "Excluir minha conta",
        description:
          "Remove o usuário autenticado e todas as tarefas associadas (cascata). Exige a senha atual.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/DeleteAccountRequest" } },
          },
        },
        responses: {
          204: { description: "Conta removida (sem corpo)" },
          400: {
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } },
            },
          },
          401: {
            description: "Token inválido ou senha incorreta",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ErrorMessage" } },
            },
          },
          404: { description: "Usuário não encontrado" },
        },
      },
    },
    "/api/tasks": {
      get: {
        tags: ["Tarefas"],
        summary: "Listar tarefas",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/TaskListResponse" } },
            },
          },
          401: { description: "Não autenticado" },
        },
      },
      post: {
        tags: ["Tarefas"],
        summary: "Criar tarefa",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/TaskCreate" } },
          },
        },
        responses: {
          201: {
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/TaskResponse" } },
            },
          },
          400: {
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } },
            },
          },
          401: { description: "Não autenticado" },
        },
      },
    },
    "/api/tasks/{id}": {
      get: {
        tags: ["Tarefas"],
        summary: "Obter tarefa por id",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        responses: {
          200: {
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/TaskResponse" } },
            },
          },
          400: {
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } },
            },
          },
          401: {},
          404: {},
        },
      },
      put: {
        tags: ["Tarefas"],
        summary: "Substituir tarefa (CRUD — atualização completa)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/TaskPut" } },
          },
        },
        responses: {
          200: {
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/TaskResponse" } },
            },
          },
          400: {
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } },
            },
          },
          401: {},
          404: {},
        },
      },
      patch: {
        tags: ["Tarefas"],
        summary: "Atualizar parcialmente",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/TaskPatch" } },
          },
        },
        responses: {
          200: {
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/TaskResponse" } },
            },
          },
          400: {
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } },
            },
          },
          401: {},
          404: {},
        },
      },
      delete: {
        tags: ["Tarefas"],
        summary: "Excluir tarefa",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        responses: {
          204: { description: "Sem corpo" },
          400: {
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } },
            },
          },
          401: {},
          404: {},
        },
      },
    },
  },
};
