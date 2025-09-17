# FitBox Documentation Standards

Guidelines and templates for maintaining organized, high-quality documentation in the FitBox project.

## 🎯 Documentation Organization Rules

### Strict Structure - NEVER VIOLATE

#### ✅ ALLOWED Locations ONLY:

- **`README.md`** - Project root (main entry point)
- **`docs/development/`** - Development guides and technical standards
- **`docs/design/`** - Design system, UI specifications, component library
- **`docs/specifications/`** - Technical architecture, business requirements, API contracts
- **`docs/guides/`** - User guides, troubleshooting, standards (like this file)

#### ❌ FORBIDDEN - NEVER CREATE:

- Root-level documentation files (CLAUDE.md, TESTING_GUIDE.md, etc.)
- Scattered README files outside designated structure
- Random .md files in arbitrary directories
- Directories: memory/, templates/, .claude/, design-docs/, dev-docs/
- Temporary files: README*temp.md, draft*_.md, backup\__.md

### Before Creating ANY Documentation:

1. **Check existing structure** - Does this information belong in an existing file?
2. **Identify correct location** - Which docs/ subdirectory is appropriate?
3. **Avoid duplication** - Update existing files rather than creating new ones
4. **Ask for clarification** - If unsure, ask the user where documentation should go

## 📝 Documentation Types & Templates

### 1. Development Documentation (`docs/development/`)

#### Purpose: Technical implementation guides, coding standards, testing procedures

**Template Structure:**

```markdown
# [Title] - FitBox Development Guide

Brief description of what this guide covers.

## Overview

- Purpose and scope
- Prerequisites
- Quick summary

## [Main Content Sections]

- Step-by-step instructions
- Code examples
- Best practices

## Related Documentation

- Links to related docs
- External resources

---

**Last Updated**: [Date]
**Next Review**: [When to review again]
```

#### Examples:

- `README.md` - Main development guide
- `testing-guide.md` - Comprehensive testing procedures
- `deployment-guide.md` - Production deployment procedures
- `api-guidelines.md` - API development standards

### 2. Design Documentation (`docs/design/`)

#### Purpose: UI/UX specifications, design system, component library

**Template Structure:**

```markdown
# [Component/System Name] - FitBox Design System

Brief description and purpose.

## Design Principles

- Key design principles
- Accessibility requirements
- Brand alignment

## Implementation

- Usage guidelines
- Code examples
- Do's and don'ts

## Specifications

- Visual specifications
- Interaction patterns
- Responsive behavior

## Related Components

- Links to related design elements
- Design system connections
```

#### Examples:

- `design-system.md` - Complete design system overview
- `component-library.md` - Individual component specifications
- `ui-patterns.md` - Common UI patterns and implementations

### 3. Specifications Documentation (`docs/specifications/`)

#### Purpose: Technical architecture, business requirements, implementation roadmaps

**Template Structure:**

```markdown
# [Specification Name] - FitBox Technical Specifications

Clear description of what this specification covers.

## Overview

- Business context
- Technical requirements
- Success criteria

## Requirements

- Functional requirements
- Non-functional requirements
- Constraints and assumptions

## Implementation

- Technical approach
- Dependencies
- Timeline and phases

## Validation

- Acceptance criteria
- Testing requirements
- Success metrics
```

#### Examples:

- `business-requirements.md` - Feature specifications
- `technical-architecture.md` - System design and infrastructure
- `api-contracts/` - REST API endpoint specifications
- `bundle-selection-spec.md` - Revenue optimization strategy

### 4. Guides Documentation (`docs/guides/`)

#### Purpose: User guides, troubleshooting, best practices, standards

**Template Structure:**

```markdown
# [Guide Title] - FitBox User Guide

Brief description of who this guide is for and what it covers.

## Quick Start

- Essential information
- Common use cases
- Quick reference

## Step-by-Step Instructions

1. Detailed procedures
2. With examples
3. Including screenshots if helpful

## Troubleshooting

- Common issues
- Solutions
- When to escalate

## Additional Resources

- Related documentation
- External links
- Support contacts
```

#### Examples:

- `documentation-standards.md` (this file) - Documentation guidelines
- `troubleshooting.md` - Common issues and solutions
- `contributing.md` - How to contribute to the project
- `faq.md` - Frequently asked questions

## ✏️ Writing Standards

### Content Quality

- **Clear and Concise**: Use simple, direct language
- **Actionable**: Provide specific steps and examples
- **Current**: Keep information up-to-date
- **Accessible**: Write for your intended audience

### Formatting Standards

- **Headings**: Use consistent heading hierarchy (H1 > H2 > H3)
- **Lists**: Use bullet points for options, numbers for sequences
- **Code**: Format code blocks with appropriate language tags
- **Links**: Use descriptive link text, verify links work

### Structure Requirements

- **Introduction**: Brief overview of purpose and scope
- **Table of Contents**: For longer documents (auto-generated preferred)
- **Cross-References**: Link to related documentation
- **Last Updated**: Include update dates for maintenance

## 🔄 Maintenance Procedures

### Regular Reviews

- **Monthly**: Check for outdated information
- **After Major Changes**: Update affected documentation
- **Before Releases**: Ensure all documentation is current

### Update Process

1. **Identify changes needed** based on code/feature updates
2. **Update relevant documentation** in existing structure
3. **Check cross-references** and update if needed
4. **Validate links** and formatting
5. **Commit with clear description** of documentation changes

### Quality Checks

- Run `npm run docs:validate` before committing
- Ensure all links work correctly
- Verify formatting consistency
- Check for spelling and grammar

## 🚨 Validation & Enforcement

### Automated Checks

```bash
# Validate documentation structure
npm run docs:validate

# Check for scattered documentation
npm run docs:check
```

### Pre-commit Validation

The project includes automated validation that checks:

- ✅ Documentation is in allowed locations only
- ❌ Prevents scattered or duplicate documentation
- 🔍 Validates file naming conventions
- 📁 Ensures proper directory structure

### Manual Verification

Before creating any documentation:

1. **Check existing structure**: Does this information already exist?
2. **Identify correct location**: Where should this documentation live?
3. **Avoid duplication**: Can I update an existing file instead?
4. **Follow templates**: Use appropriate template for document type

## 📚 Documentation Types Quick Reference

| Information Type      | Location                             | Template      |
| --------------------- | ------------------------------------ | ------------- |
| Setup & Installation  | `docs/development/README.md`         | Development   |
| API Documentation     | `docs/specifications/api-contracts/` | Specification |
| Component Library     | `docs/design/`                       | Design        |
| Business Requirements | `docs/specifications/`               | Specification |
| Troubleshooting       | `docs/guides/`                       | Guide         |
| Testing Procedures    | `docs/development/testing-guide.md`  | Development   |
| Design System         | `docs/design/design-system.md`       | Design        |

## ❓ When in Doubt

### Ask These Questions:

1. **Does this information already exist somewhere?**
2. **Which docs/ subdirectory is most appropriate?**
3. **Can I update an existing file instead of creating a new one?**
4. **Will this information be maintained and kept current?**

### If Unsure:

- **Ask the user** for clarification on documentation location
- **Check similar existing documentation** for patterns
- **Default to updating existing files** rather than creating new ones
- **Use the most specific location** in the docs/ hierarchy

## 🎯 Success Metrics

### Good Documentation Structure:

- ✅ All documentation in designated docs/ locations
- ✅ No scattered or duplicate files
- ✅ Clear navigation between related documents
- ✅ Consistent formatting and structure
- ✅ Up-to-date and accurate information

### Validation Indicators:

- `npm run docs:validate` passes without errors
- No forbidden documentation patterns detected
- Clear documentation hierarchy maintained
- Easy to find relevant information
- Cross-references work correctly

---

**Remember**: The goal is **organized, maintainable documentation** that scales with the project and serves all team members effectively.

**Last Updated**: September 16, 2025
**Next Review**: When significant project structure changes occur
