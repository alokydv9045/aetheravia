async function test() {
  console.log('Testing Google signin URL...');
  try {
    const res = await fetch('http://localhost:3000/api/auth/signin/google', {
      method: 'POST',
      redirect: 'manual'
    });
    console.log('Status Code:', res.status);
    console.log('Headers:', [...res.headers.entries()]);
    const body = await res.text();
    console.log('Body:', body);
  } catch (err) {
    console.error('❌ Request failed:', err);
  }
}
test();

export {};
