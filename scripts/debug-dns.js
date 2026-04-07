const dns = require('dns').promises;
dns.setServers(['8.8.8.8']);

async function resolve() {
  try {
    const srv = await dns.resolveSrv('_mongodb._tcp.cluster0.uth5flq.mongodb.net');
    console.log('SRV Records:', JSON.stringify(srv, null, 2));
    
    for (const record of srv) {
      const addresses = await dns.resolve4(record.name);
      console.log(`Node ${record.name} IP:`, addresses.join(', '));
    }
  } catch (err) {
    console.error('DNS Resolution Error:', err);
  }
}

resolve();
