import { handleCreatePlan } from '../../lib/apiRouter.js';

export async function POST(request) {
  try {
    return await handleCreatePlan(request);
  } catch (err) {
    console.error('api/plans POST error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
