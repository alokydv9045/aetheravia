#!/usr/bin/env node
/**
 * Environment Variable Manager
 * Helps manage and validate environment variables across different environments
 */

const fs = require('fs');
const path = require('path');

const ENV_FILES = {
  complete: '.env.complete.example',
  production: '.env.production.example',
  local: '.env.local',
  '3pl': '.env.3pl.example'
};

class EnvManager {
  static validateEnvFile(filePath) {
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Environment file not found: ${filePath}`);
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(line => 
      line.trim() && !line.startsWith('#') && line.includes('=')
    );

    const variables = {};
    const issues = [];

    lines.forEach((line, index) => {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=');

      if (!key.trim()) {
        issues.push(`Line ${index + 1}: Empty variable name`);
        return;
      }

      if (!value.trim()) {
        issues.push(`Line ${index + 1}: Empty value for ${key.trim()}`);
      }

      variables[key.trim()] = value.trim();
    });

    console.log(`✅ Found ${Object.keys(variables).length} variables in ${filePath}`);
    
    if (issues.length > 0) {
      console.warn('⚠️  Issues found:');
      issues.forEach(issue => console.warn(`   ${issue}`));
    }

    return { variables, issues };
  }

  static compareEnvFiles(file1, file2) {
    const env1 = this.validateEnvFile(file1);
    const env2 = this.validateEnvFile(file2);

    if (!env1 || !env2) return;

    const keys1 = Object.keys(env1.variables);
    const keys2 = Object.keys(env2.variables);

    const onlyIn1 = keys1.filter(key => !keys2.includes(key));
    const onlyIn2 = keys2.filter(key => !keys1.includes(key));
    const common = keys1.filter(key => keys2.includes(key));

    console.log(`\n📊 Comparison between ${file1} and ${file2}:`);
    console.log(`   Common variables: ${common.length}`);
    console.log(`   Only in ${file1}: ${onlyIn1.length}`);
    console.log(`   Only in ${file2}: ${onlyIn2.length}`);

    if (onlyIn1.length > 0) {
      console.log(`\n🔍 Variables only in ${file1}:`);
      onlyIn1.forEach(key => console.log(`   ${key}`));
    }

    if (onlyIn2.length > 0) {
      console.log(`\n🔍 Variables only in ${file2}:`);
      onlyIn2.forEach(key => console.log(`   ${key}`));
    }
  }

  static generateRenderConfig() {
    const prodFile = ENV_FILES.production;
    
    if (!fs.existsSync(prodFile)) {
      console.error(`❌ Production environment file not found: ${prodFile}`);
      return;
    }

    const env = this.validateEnvFile(prodFile);
    if (!env) return;

    console.log('\n🚀 Render Environment Variables Configuration:');
    console.log('Copy these to your Render service Environment tab:\n');

    Object.entries(env.variables).forEach(([key, value]) => {
      // Don't show sensitive values in output
      const displayValue = key.includes('SECRET') || key.includes('PASSWORD') || key.includes('KEY') 
        ? '[SECURE_VALUE]' 
        : value;
      console.log(`${key}=${displayValue}`);
    });

    console.log('\n📝 Note: Replace [SECURE_VALUE] placeholders with actual secure values');
  }

  static checkRequiredVars() {
    const required = [
      'MONGODB_URI',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'SHIPPO_API_KEY',
      'RAZORPAY_KEY_ID',
      'CLOUDINARY_CLOUD_NAME'
    ];

    const localFile = ENV_FILES.local;
    
    if (!fs.existsSync(localFile)) {
      console.error(`❌ Local environment file not found: ${localFile}`);
      return;
    }

    const env = this.validateEnvFile(localFile);
    if (!env) return;

    const missing = required.filter(key => !env.variables[key] || env.variables[key] === '');
    const present = required.filter(key => env.variables[key] && env.variables[key] !== '');

    console.log('\n🔍 Required Variables Check:');
    console.log(`✅ Present: ${present.length}/${required.length}`);
    
    present.forEach(key => {
      console.log(`   ✅ ${key}`);
    });

    if (missing.length > 0) {
      console.log(`❌ Missing: ${missing.length}`);
      missing.forEach(key => {
        console.log(`   ❌ ${key}`);
      });
    }
  }

  static createTemplate(environment = 'local') {
    const templateFile = environment === 'production' ? ENV_FILES.production : ENV_FILES.complete;
    const targetFile = environment === 'production' ? '.env.production' : '.env.local';

    if (!fs.existsSync(templateFile)) {
      console.error(`❌ Template file not found: ${templateFile}`);
      return;
    }

    if (fs.existsSync(targetFile)) {
      console.log(`⚠️  Target file ${targetFile} already exists. Use --force to overwrite.`);
      return;
    }

    fs.copyFileSync(templateFile, targetFile);
    console.log(`✅ Created ${targetFile} from ${templateFile}`);
    console.log(`📝 Please update the values in ${targetFile} for your environment`);
  }
}

// CLI Interface
const command = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

switch (command) {
  case 'validate':
    const file = arg1 || ENV_FILES.local;
    EnvManager.validateEnvFile(file);
    break;

  case 'compare':
    const file1 = arg1 || ENV_FILES.local;
    const file2 = arg2 || ENV_FILES.production;
    EnvManager.compareEnvFiles(file1, file2);
    break;

  case 'render':
    EnvManager.generateRenderConfig();
    break;

  case 'check':
    EnvManager.checkRequiredVars();
    break;

  case 'create':
    const env = arg1 || 'local';
    EnvManager.createTemplate(env);
    break;

  default:
    console.log(`
🌟 AetherAvia Environment Manager

Usage:
  node env-manager.js validate [file]     - Validate environment file
  node env-manager.js compare [file1] [file2] - Compare two env files  
  node env-manager.js render              - Generate Render config
  node env-manager.js check               - Check required variables
  node env-manager.js create [local|production] - Create env file from template

Examples:
  node env-manager.js validate .env.local
  node env-manager.js compare .env.local .env.production.example
  node env-manager.js render
  node env-manager.js check
  node env-manager.js create production
    `);
}
