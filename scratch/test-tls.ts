import tls from 'tls';

const socket = tls.connect(27017, 'ac-ftplxk5-shard-00-00.bghvakr.mongodb.net', { rejectUnauthorized: false }, () => {
  console.log('✅ Connected via direct TLS!');
  socket.end();
});

socket.on('error', (err) => {
  console.error('❌ Direct TLS failed:', err);
});
