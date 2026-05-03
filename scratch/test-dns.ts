import dns from 'dns';

dns.setServers(['1.1.1.1', '8.8.8.8']);

dns.resolveSrv('_mongodb._tcp.cluster0.bghvakr.mongodb.net', (err, addresses) => {
  if (err) {
    console.error('❌ Resolve SRV with 1.1.1.1/8.8.8.8 failed:', err);
  } else {
    console.log('✅ Resolve SRV with 1.1.1.1/8.8.8.8 succeeded:', addresses);
  }
});
