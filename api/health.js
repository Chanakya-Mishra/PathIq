import { handleHealth } from '../lib/apiRouter.js';

export async function GET() {
  try {
    return await handleHealth();
  } catch (err) {
    console.error('api/health error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
