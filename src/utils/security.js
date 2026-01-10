/**
 * Security utilities for SubHub SL
 */

import { NextResponse } from 'next/server';

/**
 * Validates that required environment variables are present
 * @param {string[]} vars List of environment variable names
 * @returns {boolean}
 */
export function validateEnv(vars) {
  const missing = vars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    return false;
  }
  return true;
}

/**
 * Basic input sanitization to prevent XSS and injection
 * @param {string} input 
 * @returns {string}
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validates request origin for CSRF protection
 * @param {Request} request 
 * @returns {boolean}
 */
export function validateOrigin(request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  
  if (!origin) return true; // Browser didn't send origin, might be a direct fetch or mobile app
  
  try {
    const originUrl = new URL(origin);
    return originUrl.host === host;
  } catch (e) {
    return false;
  }
}

/**
 * Checks if a user has admin privileges
 * @param {Object} user Supabase user object
 * @returns {boolean}
 */
export function isAdmin(user) {
  if (!user || !user.email) return false;
  
  const adminEmails = process.env.ADMIN_EMAILS 
    ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim())
    : ['admin@gmail.com']; // Fallback for backward compatibility
    
  return adminEmails.includes(user.email);
}

/**
 * Standard error response for security violations
 * @param {string} message 
 * @param {number} status 
 * @returns {NextResponse}
 */
export function securityError(message = 'Security violation', status = 403) {
  return NextResponse.json(
    { error: message, timestamp: new Date().toISOString() },
    { status }
  );
}
