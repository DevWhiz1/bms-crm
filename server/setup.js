// Setup script to help with initial configuration
const fs = require('fs');
const path = require('path');

console.log('🚀 BMS CRM Setup Script\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('📝 Creating .env file from .env.example...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created successfully!');
    console.log('⚠️  Please update the .env file with your actual database credentials and JWT secret.\n');
  } else {
    console.log('❌ .env.example file not found. Please create your .env file manually.');
  }
} else {
  console.log('✅ .env file already exists.\n');
}

// Display setup instructions
console.log('📋 Setup Instructions:');
console.log('1. Update your .env file with the correct database credentials');
console.log('2. Make sure your MySQL database is running');
console.log('3. Ensure the "users" table exists in your database');
console.log('4. Run: npm install');
console.log('5. Run: npm run dev (for development) or npm start (for production)');
console.log('\n🔗 API will be available at: http://localhost:3000/api');
console.log('📊 Health check: http://localhost:3000/api/health');
console.log('\n📚 Available endpoints:');
console.log('   POST /api/users/signup - User registration');
console.log('   POST /api/users/login - User login');
console.log('   GET  /api/users/profile - Get user profile (protected)');
console.log('   PUT  /api/users/profile - Update user profile (protected)');
console.log('   POST /api/users/logout - Logout (protected)');
console.log('   GET  /api/users/verify-token - Verify token (protected)');
console.log('\n🧪 To test the API, run: node test-api.js (after starting the server)');
console.log('\n✨ Setup complete! Happy coding!');
