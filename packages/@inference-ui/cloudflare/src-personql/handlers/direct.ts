/**
 * PersonQL Direct Access Handler
 * Bypasses GraphQL for direct database operations
 */

import type { PersonQLEnv, PersonQLDirectRequest, PersonQLDirectResponse } from '../types';

/**
 * Handle direct data access request
 */
export async function handleDirect(
  request: PersonQLDirectRequest,
  env: PersonQLEnv,
  ctx: ExecutionContext
): Promise<Response> {
  const startTime = Date.now();

  try {
    // Validate request
    if (!request.operation || !request.entity) {
      return createErrorResponse('INVALID_REQUEST', 'Operation and entity are required', 400);
    }

    // Route to appropriate handler
    let result: PersonQLDirectResponse;

    switch (request.operation) {
      case 'get':
        result = await handleGet(request, env);
        break;
      case 'list':
        result = await handleList(request, env);
        break;
      case 'create':
        result = await handleCreate(request, env);
        break;
      case 'update':
        result = await handleUpdate(request, env);
        break;
      case 'delete':
        result = await handleDelete(request, env);
        break;
      default:
        return createErrorResponse(
          'UNSUPPORTED_OPERATION',
          `Operation ${request.operation} not supported`,
          400
        );
    }

    // Add execution time to metadata
    result.metadata = {
      ...result.metadata,
      executionTime: Date.now() - startTime,
    };

    // Track analytics
    ctx.waitUntil(
      Promise.resolve(
        env.ANALYTICS.writeDataPoint({
          indexes: [request.context?.userId || 'anonymous', request.operation],
          blobs: [request.entity],
          doubles: [Date.now(), Date.now() - startTime],
        })
      )
    );

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Direct access error:', error);

    const response: PersonQLDirectResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      metadata: {
        executionTime: Date.now() - startTime,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Handle GET operation - retrieve single entity
 */
async function handleGet(
  request: PersonQLDirectRequest,
  env: PersonQLEnv
): Promise<PersonQLDirectResponse> {
  if (!request.params.id) {
    return {
      success: false,
      error: {
        code: 'MISSING_ID',
        message: 'ID parameter required for get operation',
      },
    };
  }

  const tableName = getTableName(request.entity);
  const result = await env.DB.prepare(`SELECT * FROM ${tableName} WHERE id = ?`)
    .bind(request.params.id)
    .first();

  if (!result) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `${request.entity} with id ${request.params.id} not found`,
      },
    };
  }

  return {
    success: true,
    data: result,
  };
}

/**
 * Handle LIST operation - retrieve multiple entities
 */
async function handleList(
  request: PersonQLDirectRequest,
  env: PersonQLEnv
): Promise<PersonQLDirectResponse> {
  const tableName = getTableName(request.entity);
  const limit = request.params.limit || 50;
  const offset = request.params.offset || 0;

  // Build WHERE clause from filter
  let query = `SELECT * FROM ${tableName}`;
  const bindings: unknown[] = [];

  if (request.params.filter && Object.keys(request.params.filter).length > 0) {
    const conditions: string[] = [];

    for (const [key, value] of Object.entries(request.params.filter)) {
      conditions.push(`${key} = ?`);
      bindings.push(value);
    }

    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' LIMIT ? OFFSET ?';
  bindings.push(limit, offset);

  const { results } = await env.DB.prepare(query).bind(...bindings).all();

  // Get total count
  let countQuery = `SELECT COUNT(*) as count FROM ${tableName}`;
  if (request.params.filter && Object.keys(request.params.filter).length > 0) {
    const conditions: string[] = [];
    const countBindings: unknown[] = [];

    for (const [key, value] of Object.entries(request.params.filter)) {
      conditions.push(`${key} = ?`);
      countBindings.push(value);
    }

    countQuery += ' WHERE ' + conditions.join(' AND ');
    const countResult = await env.DB.prepare(countQuery).bind(...countBindings).first<{ count: number }>();

    return {
      success: true,
      data: results,
      metadata: {
        count: results.length,
        totalCount: countResult?.count || 0,
        hasMore: (offset + results.length) < (countResult?.count || 0),
      },
    };
  }

  const countResult = await env.DB.prepare(countQuery).first<{ count: number }>();

  return {
    success: true,
    data: results,
    metadata: {
      count: results.length,
      totalCount: countResult?.count || 0,
      hasMore: (offset + results.length) < (countResult?.count || 0),
    },
  };
}

/**
 * Handle CREATE operation
 */
async function handleCreate(
  request: PersonQLDirectRequest,
  env: PersonQLEnv
): Promise<PersonQLDirectResponse> {
  if (!request.params.data) {
    return {
      success: false,
      error: {
        code: 'MISSING_DATA',
        message: 'Data parameter required for create operation',
      },
    };
  }

  const tableName = getTableName(request.entity);
  const data = request.params.data;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  // Build INSERT query dynamically
  const fields = ['id', ...Object.keys(data), 'created_at', 'updated_at'];
  const placeholders = fields.map(() => '?').join(', ');
  const values = [id, ...Object.values(data), now, now];

  const query = `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders})`;

  await env.DB.prepare(query).bind(...values).run();

  // Fetch the created record
  const result = await env.DB.prepare(`SELECT * FROM ${tableName} WHERE id = ?`)
    .bind(id)
    .first();

  return {
    success: true,
    data: result,
  };
}

/**
 * Handle UPDATE operation
 */
async function handleUpdate(
  request: PersonQLDirectRequest,
  env: PersonQLEnv
): Promise<PersonQLDirectResponse> {
  if (!request.params.id) {
    return {
      success: false,
      error: {
        code: 'MISSING_ID',
        message: 'ID parameter required for update operation',
      },
    };
  }

  if (!request.params.data) {
    return {
      success: false,
      error: {
        code: 'MISSING_DATA',
        message: 'Data parameter required for update operation',
      },
    };
  }

  const tableName = getTableName(request.entity);
  const data = request.params.data;
  const now = new Date().toISOString();

  // Build UPDATE query dynamically
  const setStatements = Object.keys(data).map((key) => `${key} = ?`);
  setStatements.push('updated_at = ?');

  const query = `UPDATE ${tableName} SET ${setStatements.join(', ')} WHERE id = ?`;
  const values = [...Object.values(data), now, request.params.id];

  const result = await env.DB.prepare(query).bind(...values).run();

  if (!result.success) {
    return {
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: 'Failed to update entity',
      },
    };
  }

  // Fetch the updated record
  const updated = await env.DB.prepare(`SELECT * FROM ${tableName} WHERE id = ?`)
    .bind(request.params.id)
    .first();

  return {
    success: true,
    data: updated,
  };
}

/**
 * Handle DELETE operation
 */
async function handleDelete(
  request: PersonQLDirectRequest,
  env: PersonQLEnv
): Promise<PersonQLDirectResponse> {
  if (!request.params.id) {
    return {
      success: false,
      error: {
        code: 'MISSING_ID',
        message: 'ID parameter required for delete operation',
      },
    };
  }

  const tableName = getTableName(request.entity);

  const result = await env.DB.prepare(`DELETE FROM ${tableName} WHERE id = ?`)
    .bind(request.params.id)
    .run();

  return {
    success: result.success,
    data: { deleted: result.success, id: request.params.id },
  };
}

/**
 * Get table name from entity type
 */
function getTableName(entity: string): string {
  const tableMap: Record<string, string> = {
    person: 'persons',
    organization: 'organizations',
    relationship: 'relationships',
    event: 'events',
  };

  const tableName = tableMap[entity];

  if (!tableName) {
    throw new Error(`Unknown entity type: ${entity}`);
  }

  return tableName;
}

/**
 * Create error response
 */
function createErrorResponse(code: string, message: string, status: number): Response {
  const response: PersonQLDirectResponse = {
    success: false,
    error: { code, message },
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
