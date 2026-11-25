import { handleReport } from '../lib/apiRouter.js';

export async function POST(request) {
  try {
    return await handleReport(request);
  } catch (err) {
    console.error('api/report error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
