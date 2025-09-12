# FitBox Premium Design System

A comprehensive design system for the FitBox meal delivery app, inspired by modern food delivery experiences and premium UI/UX patterns.

## Overview

This design system transforms the FitBox app into a premium, polished experience that competes with top-tier food delivery platforms. It builds upon the existing Next.js 14 + shadcn/ui foundation while introducing elevated visual design patterns.

## Design Philosophy

- **Premium First**: Every component designed to feel expensive and sophisticated
- **Mobile-First**: Optimized for mobile with progressive enhancement
- **User-Centric**: Streamlined UX reducing cognitive load and friction
- **Performance-Aware**: All animations and interactions optimize for 60fps
- **Accessible**: WCAG 2.1 AA compliance built-in

## Core Principles

1. **Elegant Simplicity**: Clean, uncluttered interfaces with purposeful elements
2. **Visual Hierarchy**: Clear information architecture guiding user attention
3. **Emotional Connection**: Subtle animations and micro-interactions creating delight
4. **Consistency**: Cohesive patterns across all touchpoints
5. **Quality Perception**: Design choices that communicate premium value

## Getting Started

```tsx
// Import design tokens
import { colors, spacing, typography } from '@/design-system/tokens'

// Use semantic color system
;<div className="bg-primary-50 text-primary-900">Premium content</div>
```

## Structure

- `tokens/` - Design tokens (colors, typography, spacing)
- `components/` - Component specifications and examples
- `patterns/` - Layout and interaction patterns
- `assets/` - Icons, illustrations, and brand assets
- `animations/` - Animation specifications and utilities

## Quick Reference

| Element       | Primary          | Secondary       | Usage             |
| ------------- | ---------------- | --------------- | ----------------- |
| Brand Colors  | Navy #09205c     | Coral #ff8b73   | Identity, CTAs    |
| Status Colors | Success #22c55e  | Warning #f59e0b | States, feedback  |
| Neutrals      | Gray-900 #111827 | Gray-50 #f9fafb | Text, backgrounds |

## Performance Standards

- **Load Time**: <3s on 3G networks
- **Animations**: 60fps with hardware acceleration
- **Touch Targets**: Minimum 44px for accessibility
- **Bundle Impact**: <50KB additional size

---

_Last updated: 2025-09-12_
