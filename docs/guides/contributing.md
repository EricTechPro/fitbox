# Contributing to FitBox

Guidelines for contributing to the FitBox meal delivery platform.

**Last Updated**: 2025-11-01

---

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Code Review Guidelines](#code-review-guidelines)

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js 18+** and npm/yarn
- **PostgreSQL 14+** installed and running
- **Git** configured with your name and email
- Familiarity with **TypeScript**, **React**, and **Next.js**

### Setup Development Environment

1. **Fork and clone the repository**:

```bash
git clone https://github.com/your-username/fitbox-app.git
cd fitbox-app
```

2. **Install dependencies**:

```bash
npm install
```

3. **Setup environment variables**:

```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. **Setup database**:

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

5. **Start development server**:

```bash
npm run dev
```

Visit http://localhost:3000 to verify setup.

---

## Development Workflow

### 1. Check Current Tasks

Before starting work, check what needs to be done:

```bash
# View project status and next tasks
npm run tasks:status
npm run tasks:next
```

**Task Documentation**: See [tasks.md](../specifications/tasks.md) for the complete roadmap.

### 2. Create a Feature Branch

```bash
# For new features
git checkout -b feature/T###-description

# For bug fixes
git checkout -b fix/issue-description

# For documentation
git checkout -b docs/topic
```

**Branch Naming**:

- `feature/T###-description` - New features (T### = task number from tasks.md)
- `fix/bug-description` - Bug fixes
- `docs/topic` - Documentation updates
- `refactor/component-name` - Code refactoring

### 3. Follow TDD Methodology (NON-NEGOTIABLE)

FitBox follows strict Test-Driven Development:

**Order of Implementation**:

1. **Contract Tests First** - Define and test API contracts
2. **Integration Tests** - Test database operations
3. **Implementation** - Write the actual code
4. **E2E Tests** - Test complete user workflows
5. **Unit Tests** - Test component behavior

**Example**:

```bash
# 1. Write failing contract test
touch tests/contract/api-subscription.test.ts
npm run test:contract  # Should fail

# 2. Write failing integration test
touch tests/integration/subscription-service.test.ts
npm run test:integration  # Should fail

# 3. Implement feature
touch src/app/api/subscriptions/route.ts
npm run test  # Tests should pass

# 4. Write E2E test
touch tests/e2e/subscription-flow.spec.ts
npm run test:e2e  # Should pass

# 5. Write unit tests
touch tests/unit/subscription-card.test.tsx
npm run test:unit  # Should pass
```

**See**: [Testing Guide](../development/testing-guide.md) for complete methodology.

---

## Code Standards

### TypeScript

- **Strict mode enabled** - No `any` types without justification
- **Explicit return types** for functions
- **Interface over type** for object shapes
- **Proper error handling** with typed errors

```typescript
// ✅ Good
interface Meal {
  id: string
  name: string
  price: number
}

async function getMeal(id: string): Promise<Meal> {
  try {
    return await prisma.meal.findUnique({ where: { id } })
  } catch (error) {
    throw new DatabaseError('Failed to fetch meal', { cause: error })
  }
}

// ❌ Bad
async function getMeal(id: any): Promise<any> {
  return await prisma.meal.findUnique({ where: { id } })
}
```

### React Components

- **Functional components** with hooks
- **TypeScript for props** with proper interfaces
- **Server Components by default**, Client Components when needed
- **Atomic Design Pattern**: atoms → molecules → organisms

```typescript
// ✅ Good - Server Component
interface MealCardProps {
  meal: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
}

export function MealCard({ meal }: MealCardProps) {
  return (
    <Card>
      <CardHeader>{meal.name}</CardHeader>
      <CardContent>
        <p>${meal.price}</p>
      </CardContent>
    </Card>
  );
}

// Client Component when needed
'use client';

interface AddToCartButtonProps {
  mealId: string;
  onAdd: (id: string) => void;
}

export function AddToCartButton({ mealId, onAdd }: AddToCartButtonProps) {
  return <Button onClick={() => onAdd(mealId)}>Add to Cart</Button>;
}
```

### API Routes

- **RESTful conventions** - Proper HTTP methods and status codes
- **Input validation** with Zod schemas
- **Consistent error responses** - Use standard error format
- **Authentication** where required

```typescript
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'

const createMealSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
})

export async function POST(request: Request) {
  // Authentication
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    )
  }

  // Validation
  const body = await request.json()
  const result = createMealSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: result.error.flatten(),
        },
      },
      { status: 400 }
    )
  }

  // Implementation
  const meal = await prisma.meal.create({
    data: result.data,
  })

  return NextResponse.json({ meal }, { status: 201 })
}
```

### Database Access

- **Prisma ORM** for all database operations
- **Type-safe queries** - Leverage Prisma's TypeScript integration
- **Transactions** for related operations
- **Optimistic concurrency** for critical updates

```typescript
// ✅ Good
async function updateSubscription(id: string, meals: string[]) {
  return await prisma.$transaction(async tx => {
    const subscription = await tx.subscription.update({
      where: { id },
      data: { selectedMeals: meals },
    })

    await tx.order.create({
      data: {
        subscriptionId: id,
        meals: { connect: meals.map(id => ({ id })) },
      },
    })

    return subscription
  })
}

// ❌ Bad - No transaction
async function updateSubscription(id: string, meals: string[]) {
  await prisma.subscription.update({
    where: { id },
    data: { selectedMeals: meals },
  })

  await prisma.order.create({
    // Could fail, leaving inconsistent state
    data: { subscriptionId: id },
  })
}
```

### Code Formatting

We use automated formatting tools:

```bash
# Run before committing
npm run lint        # ESLint
npm run format      # Prettier
npm run type-check  # TypeScript
```

**Pre-commit hooks automatically run these checks**.

---

## Testing Requirements

### Coverage Requirements

- **Unit Tests**: ≥80% coverage
- **Integration Tests**: ≥70% coverage
- **E2E Tests**: All critical user journeys

### Running Tests

```bash
# Run all tests
npm run test

# Run specific test types
npm run test:contract
npm run test:integration
npm run test:e2e
npm run test:unit

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
```

### Writing Good Tests

```typescript
// ✅ Good Test
describe('Subscription API', () => {
  it('should create subscription with valid bundle', async () => {
    // Arrange
    const user = await createTestUser()
    const bundle = await createTestBundle()

    // Act
    const response = await POST('/api/subscriptions', {
      bundleId: bundle.id,
      userId: user.id,
    })

    // Assert
    expect(response.status).toBe(201)
    expect(response.body.subscription.bundleId).toBe(bundle.id)
  })

  it('should reject invalid bundle size', async () => {
    const response = await POST('/api/subscriptions', {
      bundleId: 'invalid',
    })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })
})
```

**See**: [Testing Guide](../development/testing-guide.md) for comprehensive examples.

---

## Documentation

### When to Update Documentation

Update documentation when you:

- **Add new features** - Document in specifications
- **Change APIs** - Update API contracts
- **Fix bugs** - Add to troubleshooting if relevant
- **Refactor code** - Update architecture docs if structure changes

### Documentation Standards

Follow the [Documentation Standards](./documentation-standards.md) guide:

- Use **approved locations** only (docs/development, docs/design, docs/specifications, docs/guides)
- Follow **template structures** for consistency
- Include **examples** and code snippets
- Add **cross-references** to related documentation
- Update **Last Updated** date

```markdown
# Feature Name - FitBox

Brief description.

**Last Updated**: 2025-11-01

## Overview

...

## Implementation

...

## Related Documentation

- [Link to related docs](../path/to/doc.md)
```

---

## Pull Request Process

### Before Submitting

**Checklist**:

- [ ] All tests pass (`npm run test`)
- [ ] Code follows style guide (`npm run lint`)
- [ ] TypeScript compiles (`npm run type-check`)
- [ ] Documentation updated
- [ ] Commit messages follow conventions
- [ ] Task marked complete (if applicable): `npm run tasks:complete T###`

### Creating Pull Request

1. **Push your branch**:

```bash
git push origin feature/T###-description
```

2. **Create PR** with this template:

```markdown
## Summary

Brief description of changes.

## Related Task

Closes T### (if applicable)

## Changes Made

- Added feature X
- Updated component Y
- Fixed bug Z

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Screenshots

[If UI changes]

## Documentation

- [ ] Updated relevant documentation
- [ ] Added code comments where needed
```

3. **Request review** from maintainers

### Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (not CSS)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

**Examples**:

```bash
feat(api): add subscription meal selection endpoint

Implements POST /api/subscriptions/:id/meals endpoint
with validation for bundle size matching.

Related: T028

---

fix(auth): resolve session persistence issue

Session was not persisting due to missing NEXTAUTH_SECRET.
Updated auth configuration and documentation.

Closes #123

---

docs(api): add API endpoints reference documentation

Created comprehensive API documentation with examples
for all 20 implemented endpoints.
```

---

## Code Review Guidelines

### For Reviewers

When reviewing code:

1. **Functionality**: Does it work as intended?
2. **Tests**: Are tests comprehensive and passing?
3. **Code Quality**: Follows standards and best practices?
4. **Security**: No vulnerabilities introduced?
5. **Performance**: No obvious performance issues?
6. **Documentation**: Adequately documented?

**Review Comments**:

- Be constructive and specific
- Explain the "why" behind suggestions
- Approve when ready, request changes if needed

### For Contributors

When receiving feedback:

- **Be open** to suggestions
- **Ask questions** if unclear
- **Make changes** promptly
- **Thank reviewers** for their time

---

## Additional Resources

### Documentation

- **[Development Guide](../development/README.md)** - Complete development setup
- **[Testing Guide](../development/testing-guide.md)** - Testing methodology
- **[Troubleshooting](./troubleshooting.md)** - Common issues and solutions
- **[Documentation Standards](./documentation-standards.md)** - Writing guidelines

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React Documentation](https://react.dev/)

---

## Questions or Need Help?

- **Documentation**: Check the guides above first
- **Technical Issues**: See [Troubleshooting Guide](./troubleshooting.md)
- **Development**: Refer to [Development Guide](../development/README.md)

---

**Thank you for contributing to FitBox!** 🎉

Your contributions help make FitBox a better platform for healthy meal delivery.
