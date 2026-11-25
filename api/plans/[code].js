import { handleGetPlan } from '../../lib/apiRouter.js';

export async function GET(request) {
  try {
    return await handleGetPlan(request);
  } catch (err) {
    console.error('api/plans/[code] GET error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
