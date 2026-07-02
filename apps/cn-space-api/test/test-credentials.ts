/**
 * Shared credentials for the seeded admin user used across E2E tests.
 *
 * The password below is hashed at seed time (see CnTestDbInitializerService)
 * so the plaintext is known and the real login endpoint can be exercised.
 */
export const TEST_ADMIN_ID = '06866542-f089-46dc-b57f-a11e25a23aa5';
export const TEST_ADMIN_EMAIL = 'user.admin@gencovery.com';
export const TEST_ADMIN_PASSWORD = 'test-password';
