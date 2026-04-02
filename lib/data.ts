import bcrypt from 'bcryptjs';

const data = {
  users: [
    {
      name: 'Admin',
      email: 'admin@admin.com',
      password: bcrypt.hashSync('admin123', 12),
      isAdmin: true,
    },
    {
      name: 'Test',
      email: 'test@test.com',
      password: bcrypt.hashSync('test', 12),
      isAdmin: false,
    },
  ],
  products: [
    // Skincare products will be seeded via scripts/seed-skincare-simple.js
  ],
};

export default data;
