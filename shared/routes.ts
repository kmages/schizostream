import { z } from 'zod';
import { 
  insertDocumentSchema, documents,
  insertTimelineEventSchema, timelineEvents,
  insertTaskSchema, tasks,
  insertMedicationSchema, medications,
  insertMedicationLogSchema, medicationLogs,
  insertSymptomLogSchema, symptomLogs,
  insertChatMessageSchema, chatMessages
} from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  documents: {
    list: {
      method: 'GET' as const,
      path: '/api/documents',
      responses: {
        200: z.array(z.custom<typeof documents.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/documents',
      input: insertDocumentSchema,
      responses: {
        201: z.custom<typeof documents.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/documents/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  timeline: {
    list: {
      method: 'GET' as const,
      path: '/api/timeline',
      responses: {
        200: z.array(z.custom<typeof timelineEvents.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/timeline',
      input: insertTimelineEventSchema,
      responses: {
        201: z.custom<typeof timelineEvents.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/timeline/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  tasks: {
    list: {
      method: 'GET' as const,
      path: '/api/tasks',
      responses: {
        200: z.array(z.custom<typeof tasks.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/tasks',
      input: insertTaskSchema,
      responses: {
        201: z.custom<typeof tasks.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/tasks/:id',
      input: insertTaskSchema.partial(),
      responses: {
        200: z.custom<typeof tasks.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/tasks/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  medications: {
    list: {
      method: 'GET' as const,
      path: '/api/medications',
      responses: {
        200: z.array(z.custom<typeof medications.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/medications',
      input: insertMedicationSchema,
      responses: {
        201: z.custom<typeof medications.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/medications/:id',
      input: insertMedicationSchema.partial(),
      responses: {
        200: z.custom<typeof medications.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/medications/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    log: {
      create: {
        method: 'POST' as const,
        path: '/api/medications/:id/logs',
        input: insertMedicationLogSchema,
        responses: {
          201: z.custom<typeof medicationLogs.$inferSelect>(),
          400: errorSchemas.validation,
        },
      },
      list: {
        method: 'GET' as const,
        path: '/api/medications/logs',
        responses: {
          200: z.array(z.custom<typeof medicationLogs.$inferSelect>()),
        },
      }
    }
  },
  symptoms: {
    list: {
      method: 'GET' as const,
      path: '/api/symptoms',
      responses: {
        200: z.array(z.custom<typeof symptomLogs.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/symptoms',
      input: insertSymptomLogSchema,
      responses: {
        201: z.custom<typeof symptomLogs.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  chat: {
    list: {
      method: 'GET' as const,
      path: '/api/chat',
      responses: {
        200: z.array(z.custom<typeof chatMessages.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/chat',
      input: insertChatMessageSchema,
      responses: {
        201: z.custom<typeof chatMessages.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
