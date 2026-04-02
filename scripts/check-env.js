// Simple environment check script used in development
// Validates minimum required environment variables for the project

const required = [
  'MONGODB_URI',
  'NEXTAUTH_SECRET',
];

const errors = [];

required.forEach((key) => {
  const value = process.env[key] || '';
  if (!value) {
    errors.push(`${key} is missing`);
  }
  if (key === 'NEXTAUTH_SECRET' && value.length < 32) {
    errors.push('NEXTAUTH_SECRET must be at least 32 characters');
  }
});

if (errors.length > 0) {
  console.error('Environment validation failed:\n  - ' + errors.join('\n  - '));
  process.exit(1);
}

console.log('✅ Minimal environment validation passed.');
