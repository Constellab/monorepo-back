/**
 * Shared credentials for the seeded admin user used across E2E tests.
 *
 * hn-community-api authenticates locally by email only (no password column on
 * HnUser — see HnUserService.getUserCredentialsResponse), so the E2E login just
 * needs a user with this email to exist in the test database.
 */
export const TEST_ADMIN_ID = '06866542-f089-46dc-b57f-a11e25a23aa5';
export const TEST_ADMIN_EMAIL = 'user.admin@gencovery.com';
export const TEST_ADMIN_PASSWORD = 'test-password';
