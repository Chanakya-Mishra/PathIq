import { handleFeedback } from '../lib/apiRouter.js';

export async function POST(request) {
  try {
    return await handleFeedback(request);
  } catch (err) {
    console.error('api/feedback error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
