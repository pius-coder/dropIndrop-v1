# Feature 02: Drop Entity

## Overview
Drop entity with critical business rule: **Same-day prevention** - An article cannot be sent to the same WhatsApp group more than once per day, even across different drops.

## Critical Business Rule

### Same-Day Rule
> "Un même article ne peut pas être dans un drop envoyé dans un même groupe le même jour"

**Implementation:**
- Track all sends in `DropHistory` table
- Check `sentAt` date (day level) before sending
- Filter articles per group before drop execution
- Provide warnings to admin if conflicts detected

## Goals
1. Create Drop entity with type-safe schemas
2. Implement same-day validation logic
3. Track drop history for compliance
4. Validate drops before sending
5. Provide clear feedback on conflicts

## Implementation Checklist
- [ ] Drop types and Zod schemas
- [ ] DropHistory validation functions
- [ ] Same-day rule checker
- [ ] Filter articles by group and date
- [ ] Drop validation before send
- [ ] API methods for drop management
- [ ] Drop status management (DRAFT → SENDING → SENT)
- [ ] UI components for drop creation
- [ ] Conflict warning displays
- [ ] Documentation and tests
