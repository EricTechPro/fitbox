# FitBox API Contracts

REST API contract specifications for the FitBox meal delivery platform.

**Last Updated**: 2025-11-01

## Overview

This directory contains the complete API contract specifications for all FitBox endpoints, defined using the OpenAPI 3.0 specification format.

## Quick Start

### Viewing the Specification

```bash
# View the raw YAML file
cat api-spec.yaml

# Use an online viewer
# Upload api-spec.yaml to https://editor.swagger.io/
```

### Generating Documentation

```bash
# Install Redoc CLI (if not already installed)
npm install -g redoc-cli

# Generate static HTML documentation
redoc-cli bundle api-spec.yaml -o api-docs.html

# Serve interactive documentation
npx @redocly/cli preview-docs api-spec.yaml
```

## Contract Structure

The `api-spec.yaml` file defines:

- **Base URL**: API base path and versioning
- **Authentication**: NextAuth.js session-based authentication
- **Endpoints**: All REST API endpoints organized by resource
- **Schemas**: Data models and validation rules
- **Responses**: Success and error response formats
- **Examples**: Request/response examples for testing

## API Endpoints Overview

### Authentication (`/api/auth/*`)

- User registration and login
- Session management
- Password reset flows

### Menu (`/api/menu`)

- Weekly menu retrieval
- Meal details and filtering
- Nutritional information

### Subscriptions (`/api/subscriptions`)

- Bundle subscription management
- Meal selection and deadlines
- Subscription billing and status

### Orders (`/api/orders`)

- Order creation and retrieval
- Order history and tracking
- Delivery status updates

### Cart (`/api/cart`)

- Shopping cart operations
- Cart item management
- Cart persistence

### Bundles (`/api/bundles`)

- Available bundle options
- Pricing and discounts
- Bundle configuration

### User Profile (`/api/user/profile`)

- Profile information management
- Delivery address updates
- Preferences and settings

### Delivery (`/api/delivery/validate`)

- Postal code validation
- Delivery zone verification
- Delivery date availability

## Contract Testing

The API contracts follow Test-Driven Development (TDD) methodology:

1. **Contract Tests First**: Validate API schemas before implementation
2. **Integration Tests**: Test actual endpoint behavior against contracts
3. **E2E Tests**: Validate complete user workflows

### Running Contract Tests

```bash
# Run API contract tests
npm run test:api

# Run specific endpoint tests
npm run test:api -- --grep "menu"

# Generate coverage report
npm run test:api:coverage
```

## Contract Validation

All API endpoints must adhere to the contract specification:

### Request Validation

- Schema validation with Zod
- Type safety with TypeScript
- Input sanitization and security

### Response Validation

- Consistent response format
- Proper HTTP status codes
- Error response standards

### Authentication Requirements

- Session-based authentication
- CSRF protection
- Rate limiting on critical endpoints

## Development Workflow

### Modifying Contracts

1. **Update Specification**: Edit `api-spec.yaml` with your changes
2. **Validate Schema**: Run `npm run validate:api-spec`
3. **Update Tests**: Write failing contract tests
4. **Implement Changes**: Update API route handlers
5. **Verify Tests**: Ensure all contract tests pass

### Adding New Endpoints

1. Define endpoint in `api-spec.yaml`:

   ```yaml
   /api/new-resource:
     get:
       summary: Description of endpoint
       tags: [ResourceName]
       security:
         - sessionAuth: []
       responses:
         '200':
           description: Success response
           content:
             application/json:
               schema:
                 $ref: '#/components/schemas/ResourceResponse'
   ```

2. Define request/response schemas:

   ```yaml
   components:
     schemas:
       ResourceResponse:
         type: object
         required: [id, data]
         properties:
           id:
             type: string
           data:
             type: object
   ```

3. Write contract tests in `tests/contract/`
4. Implement route handler in `src/app/api/new-resource/route.ts`
5. Verify tests pass

## Error Response Format

All API errors follow a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "validation error details"
    }
  },
  "status": 400
}
```

### Standard Error Codes

- `VALIDATION_ERROR`: Request validation failed
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource conflict (e.g., duplicate)
- `INTERNAL_ERROR`: Server error

## Security Considerations

### Authentication

- All endpoints (except public routes) require valid session
- Session cookies are HTTP-only and secure
- CSRF tokens validated on state-changing operations

### Rate Limiting

- Authentication endpoints: 5 requests/minute
- Payment endpoints: 10 requests/minute
- General API: 100 requests/minute

### Input Validation

- All inputs validated with Zod schemas
- SQL injection prevention via Prisma ORM
- XSS protection with sanitization

## Related Documentation

- **[Technical Architecture](../technical-architecture.md)** - System design and architecture
- **[Business Requirements](../business-requirements.md)** - Feature specifications
- **[Testing Guide](../../development/testing-guide.md)** - Testing methodology
- **[Development Guide](../../development/README.md)** - Development setup and standards

## API Versioning

Current API version: **v1**

Version strategy:

- **Breaking changes**: Increment major version (v2, v3)
- **New features**: Add to current version (backward compatible)
- **Bug fixes**: No version change

### Migration Path

When breaking changes are necessary:

1. Deploy new version alongside existing version
2. Deprecation notice for old version (90 days)
3. Update client applications
4. Remove deprecated version after migration period

## Support

For API-related questions or issues:

- **Documentation**: Review this README and api-spec.yaml
- **Testing**: Check testing guide for contract testing examples
- **Errors**: See error response format section above
- **Development**: Consult development guide for setup

---

**Note**: This API follows RESTful design principles and OpenAPI 3.0 specification standards. All endpoints are contract-tested before implementation (TDD methodology).
