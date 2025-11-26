import { NextRequest } from 'next/server';
import * as notificationsRoute from '../src/app/api/notifications/route';

async function main() {
  const userId = process.argv[2] || 'test-user';
  const url = `http://localhost/api/notifications?userId=${userId}&unreadOnly=false&limit=10`;
  const req = new NextRequest(url);
  const res = await notificationsRoute.GET(req);
  console.log('status', res.status);
  const body = await res.json();
  console.log('body', body);
}

main().catch((err) => {
  console.error(err);
});
