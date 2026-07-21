import { registerDecorator, ValidationOptions } from 'class-validator';

/**
 * Known Personal Access Token prefixes per git provider.
 * - GitHub: ghp_ (classic), github_pat_ (fine-grained), gho_/ghu_/ghs_ (OAuth/app tokens)
 * - GitLab: glpat-
 * Extend this list when a new provider needs to be supported.
 */
const KNOWN_PAT_PREFIXES = ['ghp_', 'github_pat_', 'gho_', 'ghu_', 'ghs_', 'glpat-'];

/**
 * Minimum length for a token that does not match a known prefix. Providers without a
 * standard prefix (Bitbucket app passwords, Azure DevOps, self-hosted, ...) still emit
 * long opaque tokens, so we accept them as long as they look like a token.
 */
const GENERIC_TOKEN_MIN_LENGTH = 20;
const GENERIC_TOKEN_PATTERN = /^[A-Za-z0-9._-]+$/;

/**
 * Best-effort check that a value looks like a git Personal Access Token.
 *
 * This is intentionally permissive: it strongly recognizes known provider prefixes,
 * and otherwise falls back to "looks like a token" (URL-safe chars, no whitespace,
 * long enough). It is a guard against obvious mistakes (a pasted URL, a short password,
 * a value with spaces), NOT a proof that the token is valid or will authenticate.
 */
export function hnLooksLikeGitPat(value: string): boolean {
  const token = value.trim();
  if (KNOWN_PAT_PREFIXES.some((prefix) => token.startsWith(prefix))) {
    return true;
  }
  return token.length >= GENERIC_TOKEN_MIN_LENGTH && GENERIC_TOKEN_PATTERN.test(token);
}

/**
 * Class-validator decorator asserting that a string looks like a git PAT.
 * Requires a ValidationPipe to be active on the route to take effect.
 */
export function hnIsGitPat(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'hnIsGitPat',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          return typeof value === 'string' && hnLooksLikeGitPat(value);
        },
        defaultMessage(): string {
          return 'credentialPassword does not look like a valid git Personal Access Token (PAT)';
        },
      },
    });
  };
}
