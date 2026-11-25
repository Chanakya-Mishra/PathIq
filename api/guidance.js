import { handleGuidance } from '../lib/apiRouter.js';

export async function POST(request) {
  try {
    return await handleGuidance(request);
  } catch (err) {
    console.error('api/guidance error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
