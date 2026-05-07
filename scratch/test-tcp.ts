import net from 'net';

const client = net.connect(27017, 'ac-ftplxk5-shard-00-00.bghvakr.mongodb.net', () => {
  console.log('✅ Connected via direct TCP!');
  client.end();
});

client.on('error', (err) => {
  console.error('❌ Direct TCP failed:', err);
});
