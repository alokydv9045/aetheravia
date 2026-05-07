async function test() {
  console.log('Testing auth providers list...');
  try {
    const res = await fetch('http://localhost:3000/api/auth/providers');
    console.log('Status Code:', res.status);
    const data = await res.json();
    console.log('Registered Providers:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('❌ Request failed:', err);
  }
}
test();

