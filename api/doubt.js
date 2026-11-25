import { handleDoubt } from '../lib/apiRouter.js';

export async function POST(request) {
  try {
    return await handleDoubt(request);
  } catch (err) {
    console.error('api/doubt error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
