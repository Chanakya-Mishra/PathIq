import { handleListResources } from '../lib/apiRouter.js';

export async function GET(request) {
  try {
    return await handleListResources(request);
  } catch (err) {
    console.error('api/resources error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
