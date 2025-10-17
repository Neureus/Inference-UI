/**
 * PersonQL AI Enrichment Handler
 * Uses Workers AI to enrich person data
 */

import type { PersonQLEnv, PersonQLAIRequest, PersonQLAIResponse, Person } from '../types';

/**
 * Handle AI enrichment request
 */
export async function handleEnrich(
  request: PersonQLAIRequest,
  env: PersonQLEnv,
  ctx: ExecutionContext
): Promise<Response> {
  try {
    // Validate request
    if (!request.type || !request.person) {
      return createErrorResponse('Invalid request: type and person required');
    }

    // Get person data
    const personData = await getPersonData(request.person, env);

    if (!personData) {
      return createErrorResponse('Person not found');
    }

    // Route to appropriate enrichment handler
    let result: PersonQLAIResponse;

    switch (request.type) {
      case 'profile':
        result = await enrichProfile(personData, request.options, env);
        break;
      case 'insights':
        result = await generateInsights(personData, request.options, env);
        break;
      case 'recommendations':
        result = await generateRecommendations(personData, request.options, env);
        break;
      case 'classification':
        result = await classifyPerson(personData, request.options, env);
        break;
      default:
        return createErrorResponse(`Unsupported enrichment type: ${request.type}`);
    }

    // Track analytics
    ctx.waitUntil(
      Promise.resolve(
        env.ANALYTICS.writeDataPoint({
          indexes: ['ai', request.type],
          blobs: [typeof request.person === 'string' ? request.person : 'inline'],
          doubles: [Date.now()],
        })
      )
    );

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Enrichment error:', error);

    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error'
    );
  }
}

/**
 * Get person data (from ID or use provided data)
 */
async function getPersonData(
  person: string | Partial<Person>,
  env: PersonQLEnv
): Promise<Person | null> {
  if (typeof person === 'string') {
    // Fetch from database
    const result = await env.DB.prepare('SELECT * FROM persons WHERE id = ?')
      .bind(person)
      .first<Person>();

    return result;
  }

  // Use provided data (validate it has required fields)
  if (!person.id) {
    return null;
  }

  return person as Person;
}

/**
 * Enrich profile with AI-generated data
 */
async function enrichProfile(
  person: Person,
  options: PersonQLAIRequest['options'],
  env: PersonQLEnv
): Promise<PersonQLAIResponse> {
  const model = options?.model || '@cf/meta/llama-3.1-8b-instruct';

  const prompt = `Based on this person's data, generate a professional profile summary:

Name: ${person.name || 'Unknown'}
Email: ${person.email || 'N/A'}
Phone: ${person.phone || 'N/A'}
Metadata: ${JSON.stringify(person.metadata || {})}

Generate a concise professional summary (2-3 sentences).`;

  try {
    const aiResponse = await env.AI.run(model as any, {
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 200,
    });

    const summary = typeof aiResponse === 'object' && 'response' in aiResponse
      ? aiResponse.response
      : String(aiResponse);

    return {
      success: true,
      data: {
        insights: [summary],
        confidence: options?.includeConfidence ? 0.85 : undefined,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'AI enrichment failed',
        code: 'AI_ERROR',
      },
    };
  }
}

/**
 * Generate insights about a person
 */
async function generateInsights(
  person: Person,
  options: PersonQLAIRequest['options'],
  env: PersonQLEnv
): Promise<PersonQLAIResponse> {
  const model = options?.model || '@cf/meta/llama-3.1-8b-instruct';

  const prompt = `Analyze this person's data and provide 3-5 key insights:

Name: ${person.name || 'Unknown'}
Email: ${person.email || 'N/A'}
Metadata: ${JSON.stringify(person.metadata || {})}

Provide insights as a numbered list.`;

  try {
    const aiResponse = await env.AI.run(model as any, {
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 300,
    });

    const responseText = typeof aiResponse === 'object' && 'response' in aiResponse
      ? aiResponse.response
      : String(aiResponse);

    // Parse insights from numbered list
    const insights = responseText
      .split('\n')
      .filter((line: string) => /^\d+\./.test(line.trim()))
      .map((line: string) => line.replace(/^\d+\.\s*/, '').trim());

    return {
      success: true,
      data: {
        insights,
        confidence: options?.includeConfidence ? 0.8 : undefined,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'AI insights failed',
        code: 'AI_ERROR',
      },
    };
  }
}

/**
 * Generate recommendations for a person
 */
async function generateRecommendations(
  person: Person,
  options: PersonQLAIRequest['options'],
  env: PersonQLEnv
): Promise<PersonQLAIResponse> {
  const model = options?.model || '@cf/meta/llama-3.1-8b-instruct';

  const prompt = `Based on this person's profile, suggest 3-5 relevant actions or recommendations:

Name: ${person.name || 'Unknown'}
Email: ${person.email || 'N/A'}
Metadata: ${JSON.stringify(person.metadata || {})}

Provide actionable recommendations as a numbered list.`;

  try {
    const aiResponse = await env.AI.run(model as any, {
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 300,
    });

    const responseText = typeof aiResponse === 'object' && 'response' in aiResponse
      ? aiResponse.response
      : String(aiResponse);

    // Parse recommendations from numbered list
    const recommendations = responseText
      .split('\n')
      .filter((line: string) => /^\d+\./.test(line.trim()))
      .map((line: string) => line.replace(/^\d+\.\s*/, '').trim());

    return {
      success: true,
      data: {
        recommendations,
        confidence: options?.includeConfidence ? 0.75 : undefined,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'AI recommendations failed',
        code: 'AI_ERROR',
      },
    };
  }
}

/**
 * Classify person into categories
 */
async function classifyPerson(
  person: Person,
  options: PersonQLAIRequest['options'],
  _env: PersonQLEnv
): Promise<PersonQLAIResponse> {
  // Simple classification based on metadata (in production, use AI model)
  const metadata = person.metadata || {};
  const classification: Record<string, number> = {};

  // Example classifications
  if (metadata.industry) {
    classification.industry = 1.0;
  }

  if (metadata.company) {
    classification.professional = 0.9;
  }

  if (metadata.interests) {
    classification.consumer = 0.8;
  }

  // Add default classification
  classification.general = 0.5;

  return {
    success: true,
    data: {
      classification,
      confidence: options?.includeConfidence ? 0.7 : undefined,
    },
  };
}

/**
 * Create error response
 */
function createErrorResponse(message: string): Response {
  const response: PersonQLAIResponse = {
    success: false,
    error: {
      message,
      code: 'ENRICHMENT_ERROR',
    },
  };

  return new Response(JSON.stringify(response), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
}
