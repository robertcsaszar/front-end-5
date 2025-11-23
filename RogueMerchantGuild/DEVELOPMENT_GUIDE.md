# 🛠️ Rogue Merchant Guild - Development Guide

## Table of Contents
1. [Core Development Principles](#core-development-principles)
2. [Code Standards & Best Practices](#code-standards--best-practices)
3. [File Organization Rules](#file-organization-rules)
4. [Component Development](#component-development)
5. [API Development](#api-development)
6. [Database Development](#database-development)
7. [Security Standards](#security-standards)
8. [UI/UX Standards](#uiux-standards)
9. [Testing Requirements](#testing-requirements)
10. [Git Workflow](#git-workflow)
11. [Performance Standards](#performance-standards)
12. [Anti-Cheat Development](#anti-cheat-development)
13. [Code Review Checklist](#code-review-checklist)
14. [Common Patterns](#common-patterns)

---

## Core Development Principles

### 1. DRY (Don't Repeat Yourself)
**RULE**: Never duplicate code. Create reusable helpers, components, and utilities.

**❌ BAD**:
```typescript
// In multiple files
function formatGold(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
```

**✅ GOOD**:
```typescript
// client/src/utils/formatters.ts
export function formatGold(amount: number | bigint): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Usage in any component
import { formatGold } from '@/utils/formatters';
```

### 2. Single Responsibility Principle
**RULE**: Each function/class/component should do ONE thing well.

**❌ BAD**:
```typescript
// This function does too many things
async function handleUserRegistration(data: any) {
  // Validate input
  if (!data.email || !data.password) throw new Error('Invalid input');
  
  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 12);
  
  // Create user
  const user = await prisma.user.create({ data: { ...data, password: hashedPassword }});
  
  // Send email
  await sendEmail(user.email, 'Welcome!');
  
  // Generate token
  const token = jwt.sign({ userId: user.id }, JWT_SECRET);
  
  return { user, token };
}
```

**✅ GOOD**:
```typescript
// Separate concerns into dedicated functions
async function register(data: RegisterData) {
  validateRegistrationData(data);
  const hashedPassword = await hashPassword(data.password);
  const user = await createUser({ ...data, password: hashedPassword });
  await sendWelcomeEmail(user.email);
  const token = generateAuthToken(user.id);
  return { user, token };
}
```

### 3. Fail Fast
**RULE**: Validate early, throw errors immediately, don't continue with invalid state.

**❌ BAD**:
```typescript
async function startTrade(playerId: string, itemId: string) {
  const player = await getPlayer(playerId);
  // ... lots of code ...
  if (!player.energy) {
    return { error: 'No energy' }; // Too late!
  }
}
```

**✅ GOOD**:
```typescript
async function startTrade(playerId: string, itemId: string) {
  const player = await getPlayer(playerId);
  
  // Validate FIRST
  if (!player) throw new Error('Player not found');
  if (player.energy < TRADE_ENERGY_COST) throw new Error('Insufficient energy');
  if (player.inJail) throw new Error('Cannot trade while in jail');
  
  // Now proceed with confidence
  // ...
}
```

### 4. Security First
**RULE**: Every feature must be developed with security in mind from day one.

**❌ BAD**:
```typescript
// Accepting user input directly
app.post('/api/player/gold', (req, res) => {
  const { amount } = req.body;
  player.gold += amount; // EXPLOITABLE!
});
```

**✅ GOOD**:
```typescript
// Server validates everything
app.post('/api/trade/complete', authMiddleware, async (req, res) => {
  const { operationId } = req.body;
  
  // Server calculates everything, no trust in client
  const operation = await getOperation(operationId);
  if (operation.playerId !== req.user.id) throw new Error('Unauthorized');
  if (operation.completesAt > new Date()) throw new Error('Not ready');
  
  const profit = calculateProfit(operation); // SERVER calculates
  await addGold(req.user.id, profit);
});
```

### 5. Type Safety
**RULE**: Use TypeScript strictly. No `any` types unless absolutely necessary.

**❌ BAD**:
```typescript
function processData(data: any) {
  return data.items.map((item: any) => item.price);
}
```

**✅ GOOD**:
```typescript
interface Item {
  id: string;
  name: string;
  price: number;
}

interface ProcessData {
  items: Item[];
}

function processData(data: ProcessData): number[] {
  return data.items.map(item => item.price);
}
```

---

## Code Standards & Best Practices

### Naming Conventions

**Files**:
- Components: `PascalCase` → `PlayerCard.tsx`
- Utilities: `camelCase` → `formatters.ts`
- Services: `camelCase.service.ts` → `trading.service.ts`
- Types: `camelCase.types.ts` → `player.types.ts`

**Variables & Functions**:
- Variables: `camelCase` → `playerGold`
- Constants: `UPPER_SNAKE_CASE` → `MAX_ENERGY`
- Functions: `camelCase` → `calculateProfit()`
- Classes: `PascalCase` → `TradingService`
- Interfaces: `PascalCase` → `Player`
- Types: `PascalCase` → `PlayerStatus`

**Examples**:
```typescript
// Constants
const MAX_INVENTORY_SIZE = 100;
const ENERGY_REGEN_RATE = 1; // per minute
const GOLD_MULTIPLIER = 1.5;

// Variables
let currentGold = 0;
const playerLevel = 5;
const isInJail = false;

// Functions
function calculateTradingProfit(investment: number, riskLevel: string): number {
  // ...
}

async function startTradingOperation(playerId: string, items: Item[]): Promise<Operation> {
  // ...
}

// Classes
class MarketService {
  async getPrices(kingdom: string): Promise<Price[]> {
    // ...
  }
}

// Interfaces
interface Player {
  id: string;
  level: number;
  gold: bigint;
  energy: number;
}

interface TradingOperation {
  id: string;
  playerId: string;
  status: OperationStatus;
  completesAt: Date;
}
```

### Comments & Documentation

**RULE**: Write self-explanatory code. Use comments to explain WHY, not WHAT.

**❌ BAD**:
```typescript
// Set player gold to 100
player.gold = 100;

// Loop through items
for (const item of items) {
  // Add item price to total
  total += item.price;
}
```

**✅ GOOD**:
```typescript
// Reset starting gold for new players
player.gold = STARTING_GOLD;

// Calculate total value considering market fluctuations
// We need the total before applying the 20% discount for guild members
const totalValue = items.reduce((sum, item) => sum + item.price, 0);
const discountedTotal = player.guildId ? totalValue * 0.8 : totalValue;
```

**Function Documentation**:
```typescript
/**
 * Calculate the actual profit from a trading operation
 * 
 * This accounts for:
 * - Base profit from operation type
 * - Player's charisma stat (improves deals)
 * - Random variance (±20%)
 * - Active market events
 * 
 * @param operation - The trading operation to calculate profit for
 * @param playerStats - Player's current stats
 * @returns The calculated profit in gold
 * 
 * @throws {Error} If operation is not completed
 * 
 * @example
 * const profit = calculateProfit(operation, player);
 * // profit = 1500 (base 1000 + 20% charisma + 10% variance)
 */
function calculateProfit(operation: Operation, playerStats: PlayerStats): number {
  // Implementation
}
```

---

## File Organization Rules

### Component Structure

**RULE**: Every component gets its own folder with index file for clean imports.

```
components/
├── common/
│   ├── Button/
│   │   ├── Button.tsx           # Main component
│   │   ├── Button.test.tsx      # Tests
│   │   ├── Button.types.ts      # TypeScript interfaces
│   │   ├── useButton.ts         # Component-specific hook (if needed)
│   │   └── index.ts             # Export
│   ├── Modal/
│   │   ├── Modal.tsx
│   │   ├── Modal.test.tsx
│   │   └── index.ts
│   └── Card/
│       ├── Card.tsx
│       ├── Card.test.tsx
│       └── index.ts
└── game/
    ├── TradePanel/
    │   ├── TradePanel.tsx
    │   ├── TradeItem.tsx        # Sub-components
    │   ├── TradePanel.test.tsx
    │   └── index.ts
    └── Inventory/
        ├── Inventory.tsx
        ├── InventoryItem.tsx
        ├── InventoryGrid.tsx
        └── index.ts
```

**Index File Pattern**:
```typescript
// components/common/Button/index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button.types';

// Now you can import cleanly:
import { Button } from '@/components/common/Button';
```

### Service Structure

**RULE**: Each service handles one domain of the application.

```
server/src/services/
├── auth.service.ts              # Authentication & sessions
├── player.service.ts            # Player data & progression
├── trading.service.ts           # Trading operations
├── market.service.ts            # Market prices & listings
├── guild.service.ts             # Guild management
├── inventory.service.ts         # Inventory management
├── achievement.service.ts       # Achievements & rewards
├── event.service.ts             # Game events
├── antiCheat.service.ts         # Cheat detection
└── notification.service.ts      # Notifications & alerts
```

**Service Pattern**:
```typescript
// service-name.service.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ServiceName {
  /**
   * Public methods that can be called by controllers
   */
  async publicMethod(param: string): Promise<ReturnType> {
    // Validate inputs
    this.validateInput(param);
    
    // Business logic
    const result = await this.privateMethod(param);
    
    return result;
  }

  /**
   * Private helper methods (prefix with private or _)
   */
  private async privateMethod(param: string): Promise<any> {
    // Implementation
  }

  private validateInput(param: string): void {
    if (!param) throw new Error('Invalid input');
  }
}
```

---

## Component Development

### React Component Template

**RULE**: All components follow this structure for consistency.

```typescript
// components/game/TradePanel/TradePanel.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { startTrade } from '@/store/slices/tradingSlice';
import { Button } from '@/components/common/Button';
import { formatGold, formatTime } from '@/utils/formatters';
import type { TradePanelProps } from './TradePanel.types';

/**
 * TradePanel - Main trading interface component
 * 
 * Allows players to:
 * - Select items to trade
 * - Choose operation type
 * - View expected profit and risk
 * - Start trading operations
 */
export const TradePanel: React.FC<TradePanelProps> = ({ 
  onTradeStart, 
  disabled = false 
}) => {
  // ========================================
  // STATE & HOOKS
  // ========================================
  const dispatch = useAppDispatch();
  const player = useAppSelector(state => state.player.data);
  const { loading, error } = useAppSelector(state => state.trading);
  
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [operationType, setOperationType] = useState<OperationType>('SimpleTrade');

  // ========================================
  // COMPUTED VALUES
  // ========================================
  const hasEnoughEnergy = player.energy >= getEnergyCost(operationType);
  const estimatedProfit = calculateEstimatedProfit(selectedItems, operationType);
  const canTrade = selectedItems.length > 0 && hasEnoughEnergy && !disabled;

  // ========================================
  // HANDLERS
  // ========================================
  const handleItemSelect = useCallback((itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  const handleStartTrade = useCallback(async () => {
    if (!canTrade) return;

    try {
      await dispatch(startTrade({
        items: selectedItems,
        operationType,
      })).unwrap();

      onTradeStart?.();
      setSelectedItems([]);
    } catch (error) {
      console.error('Trade failed:', error);
    }
  }, [canTrade, selectedItems, operationType, dispatch, onTradeStart]);

  // ========================================
  // EFFECTS
  // ========================================
  useEffect(() => {
    // Reset selection if player runs out of energy
    if (!hasEnoughEnergy) {
      setSelectedItems([]);
    }
  }, [hasEnoughEnergy]);

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="trade-panel bg-gray-800 rounded-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Trade Center</h2>
        <div className="text-sm text-gray-400">
          Energy: {player.energy}/{player.maxEnergy}
        </div>
      </div>

      {/* Operation Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Operation Type
        </label>
        <select 
          value={operationType}
          onChange={(e) => setOperationType(e.target.value as OperationType)}
          className="w-full px-4 py-2 bg-gray-700 text-white rounded"
        >
          <option value="SimpleTrade">Simple Trade (Low Risk)</option>
          <option value="Smuggling">Smuggling (Medium Risk)</option>
          <option value="BlackMarket">Black Market (High Risk)</option>
        </select>
      </div>

      {/* Item Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Select Items</h3>
        {/* Item grid implementation */}
      </div>

      {/* Profit Estimation */}
      {selectedItems.length > 0 && (
        <div className="bg-gray-700 rounded p-4 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Expected Profit:</span>
            <span className="text-green-400 font-bold">
              {formatGold(estimatedProfit)} gold
            </span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-gray-400">Duration:</span>
            <span className="text-white">{formatTime(getDuration(operationType))}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Action Button */}
      <Button
        onClick={handleStartTrade}
        disabled={!canTrade || loading}
        variant="primary"
        fullWidth
      >
        {loading ? 'Starting Trade...' : 'Start Trade'}
      </Button>
    </div>
  );
};

// ========================================
// HELPER FUNCTIONS (Keep at bottom)
// ========================================
function getEnergyCost(type: OperationType): number {
  const costs = {
    SimpleTrade: 10,
    Smuggling: 25,
    BlackMarket: 40,
  };
  return costs[type];
}

function getDuration(type: OperationType): number {
  const durations = {
    SimpleTrade: 5 * 60, // 5 minutes in seconds
    Smuggling: 15 * 60,
    BlackMarket: 30 * 60,
  };
  return durations[type];
}
```

**Key Points**:
- Clear section organization with comments
- State grouped at top
- Handlers use `useCallback` for optimization
- Computed values before render
- Helper functions at bottom
- Type-safe props and state

---

## API Development

### API Endpoint Template

**RULE**: All endpoints follow RESTful conventions and proper error handling.

```typescript
// server/src/controllers/trading.controller.ts
import { Request, Response, NextFunction } from 'express';
import { TradingService } from '../services/trading.service';
import { validationResult } from 'express-validator';

const tradingService = new TradingService();

export class TradingController {
  /**
   * POST /api/trading/start
   * Start a new trading operation
   * 
   * Auth: Required
   * Rate Limit: 10 requests/minute
   */
  async startOperation(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Validate request (express-validator)
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // 2. Extract data
      const { operationType, items, fromKingdom, toKingdom } = req.body;
      const playerId = req.user!.playerId; // From auth middleware

      // 3. Call service
      const operation = await tradingService.startOperation(
        playerId,
        operationType,
        items,
        fromKingdom,
        toKingdom
      );

      // 4. Log activity (for monitoring)
      console.log(`[TRADE] Player ${playerId} started ${operationType}`);

      // 5. Return success response
      return res.status(201).json({
        success: true,
        data: operation,
        message: 'Trade started successfully',
      });

    } catch (error) {
      // Pass to error handling middleware
      next(error);
    }
  }

  /**
   * POST /api/trading/:operationId/complete
   * Complete a trading operation
   * 
   * Auth: Required
   */
  async completeOperation(req: Request, res: Response, next: NextFunction) {
    try {
      const { operationId } = req.params;
      const playerId = req.user!.playerId;

      // Verify operation belongs to player
      const operation = await tradingService.getOperation(operationId);
      if (operation.playerId !== playerId) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const result = await tradingService.completeOperation(operationId);

      return res.status(200).json({
        success: true,
        data: result,
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/trading/active
   * Get player's active operations
   * 
   * Auth: Required
   */
  async getActiveOperations(req: Request, res: Response, next: NextFunction) {
    try {
      const playerId = req.user!.playerId;
      const operations = await tradingService.getActiveOperations(playerId);

      return res.status(200).json({
        success: true,
        data: operations,
        count: operations.length,
      });

    } catch (error) {
      next(error);
    }
  }
}
```

**Route Setup**:
```typescript
// server/src/routes/trading.routes.ts
import { Router } from 'express';
import { TradingController } from '../controllers/trading.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { tradingLimiter } from '../middleware/rateLimit.middleware';
import { startOperationValidator } from '../validators/trading.validator';

const router = Router();
const tradingController = new TradingController();

// All routes require authentication
router.use(authMiddleware);

// Start trading operation
router.post(
  '/start',
  tradingLimiter,
  startOperationValidator,
  tradingController.startOperation
);

// Complete operation
router.post(
  '/:operationId/complete',
  tradingController.completeOperation
);

// Get active operations
router.get(
  '/active',
  tradingController.getActiveOperations
);

export default router;
```

### Error Handling

**RULE**: All errors must be handled consistently across the API.

```typescript
// server/src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('[ERROR]', error);

  // Operational errors (expected)
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
    });
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'Resource already exists',
      });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Resource not found',
      });
    }
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }

  // Unknown errors (don't expose details in production)
  return res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
  });
}

// Usage in services:
throw new AppError(400, 'Insufficient energy');
throw new AppError(403, 'Player is in jail');
throw new AppError(404, 'Operation not found');
```

---

## Database Development

### Prisma Best Practices

**RULE**: Always use transactions for multi-step operations.

**❌ BAD** (Race condition risk):
```typescript
async function transferGold(fromId: string, toId: string, amount: bigint) {
  const sender = await prisma.player.findUnique({ where: { id: fromId }});
  
  if (sender.gold < amount) throw new Error('Insufficient funds');
  
  // DANGER: Another transaction could happen between these two updates
  await prisma.player.update({
    where: { id: fromId },
    data: { gold: sender.gold - amount },
  });
  
  await prisma.player.update({
    where: { id: toId },
    data: { gold: { increment: amount }},
  });
}
```

**✅ GOOD** (Atomic transaction):
```typescript
async function transferGold(fromId: string, toId: string, amount: bigint) {
  return prisma.$transaction(async (tx) => {
    // All queries within this transaction are atomic
    const sender = await tx.player.findUnique({ where: { id: fromId }});
    
    if (!sender || sender.gold < amount) {
      throw new Error('Insufficient funds');
    }
    
    // Both updates happen together or not at all
    const [updatedSender, updatedReceiver] = await Promise.all([
      tx.player.update({
        where: { id: fromId },
        data: { gold: sender.gold - amount },
      }),
      tx.player.update({
        where: { id: toId },
        data: { gold: { increment: amount }},
      }),
    ]);

    // Log transaction
    await tx.transaction.create({
      data: {
        playerId: fromId,
        type: 'Transfer',
        amount: -amount,
        balanceBefore: sender.gold,
        balanceAfter: sender.gold - amount,
        description: `Transferred to ${toId}`,
      },
    });

    return { updatedSender, updatedReceiver };
  });
}
```

### Migration Best Practices

**RULE**: Migrations should be reversible and tested.

```bash
# Create migration
npx prisma migrate dev --name add_guild_treasury

# Don't modify existing migrations!
# Always create new ones for changes

# Test migration on dev database first
# Then apply to production
npx prisma migrate deploy
```

**Example Migration Strategy**:
```sql
-- Adding a new column with default value (safe)
ALTER TABLE "players" ADD COLUMN "premium_expires" TIMESTAMP;

-- Adding NOT NULL constraint (need default first)
-- Step 1: Add column with default
ALTER TABLE "players" ADD COLUMN "title" TEXT DEFAULT 'Novice';
-- Step 2: In next migration, remove default if needed
ALTER TABLE "players" ALTER COLUMN "title" DROP DEFAULT;
```

---

## Security Standards

### Input Validation

**RULE**: Never trust client input. Validate everything.

```typescript
// server/src/validators/trading.validator.ts
import { body, param, ValidationChain } from 'express-validator';

export const startOperationValidator: ValidationChain[] = [
  // Whitelist allowed operation types
  body('operationType')
    .isIn(['SimpleTrade', 'Smuggling', 'BlackMarket', 'Caravan'])
    .withMessage('Invalid operation type'),
  
  // Validate array structure
  body('items')
    .isArray({ min: 1, max: 10 })
    .withMessage('Must provide 1-10 items'),
  
  // Validate each item in array
  body('items.*.itemId')
    .isUUID()
    .withMessage('Invalid item ID'),
  
  body('items.*.quantity')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Quantity must be between 1 and 1000'),
  
  // Validate strings (prevent injection)
  body('fromKingdom')
    .trim()
    .isLength({ min: 1, max: 50 })
    .matches(/^[a-zA-Z0-9\s-]+$/)
    .withMessage('Invalid kingdom name'),
  
  // Optional field
  body('toKingdom')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .matches(/^[a-zA-Z0-9\s-]+$/)
    .withMessage('Invalid kingdom name'),
];

// Sanitize and validate user registration
export const registerValidator: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email'),
  
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-20 characters, alphanumeric and underscore only'),
  
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number'),
];
```

### SQL Injection Prevention

**RULE**: Always use parameterized queries (Prisma does this automatically).

**❌ BAD** (vulnerable to SQL injection):
```typescript
// DON'T DO THIS!
const username = req.body.username;
const query = `SELECT * FROM users WHERE username = '${username}'`;
const result = await prisma.$queryRaw(query);
```

**✅ GOOD** (safe):
```typescript
// Use Prisma's built-in protection
const username = req.body.username;
const user = await prisma.user.findUnique({
  where: { username },
});

// Or if you must use raw SQL:
const result = await prisma.$queryRaw`
  SELECT * FROM users WHERE username = ${username}
`;
// Prisma automatically escapes parameters
```

### XSS Prevention

**RULE**: Sanitize all user-generated content before displaying.

**Frontend**:
```typescript
// utils/sanitize.ts
import DOMPurify from 'dompurify';

export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'br'],
    ALLOWED_ATTR: [],
  });
}

// Usage in components
function ChatMessage({ message }: { message: string }) {
  return (
    <div 
      dangerouslySetInnerHTML={{ 
        __html: sanitizeHTML(message) 
      }} 
    />
  );
}

// Or better: Don't use dangerouslySetInnerHTML at all
function ChatMessage({ message }: { message: string }) {
  return <div>{message}</div>; // React auto-escapes
}
```

### Authentication Middleware

**RULE**: Protect all sensitive routes with authentication.

```typescript
// server/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        playerId: string;
      };
    }
  }
}

export async function authMiddleware(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  try {
    // 1. Extract token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    const token = authHeader.substring(7);

    // 2. Verify token
    const decoded = jwt.verify(token, config.jwtSecret) as any;

    // 3. Check if user exists and is not banned
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        player: {
          select: {
            id: true,
            banned: true,
            bannedUntil: true,
          },
        },
      },
    });

    if (!user || !user.player) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
      });
    }

    // 4. Check ban status
    if (user.player.banned) {
      const banMessage = user.player.bannedUntil
        ? `Account banned until ${user.player.bannedUntil}`
        : 'Account permanently banned';
      
      return res.status(403).json({
        success: false,
        error: banMessage,
      });
    }

    // 5. Attach user info to request
    req.user = {
      id: user.id,
      playerId: user.player.id,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
      });
    }
    
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
  }
}

// Optional: Admin-only middleware
export async function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Assumes authMiddleware has already run
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  const player = await prisma.player.findUnique({
    where: { id: req.user.playerId },
  });

  if (player?.rank !== 'Admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required',
    });
  }

  next();
}
```

---

## UI/UX Standards

### Responsive Design

**RULE**: All UI must work perfectly on mobile (320px+), tablet (768px+), and desktop (1024px+).

**Use Tailwind Breakpoints**:
```tsx
// Responsive component
function PlayerCard() {
  return (
    <div className="
      w-full                    /* Mobile: full width */
      sm:w-1/2                  /* Small tablet: half */
      md:w-1/3                  /* Tablet: third */
      lg:w-1/4                  /* Desktop: quarter */
      p-4                       /* Padding on all */
      sm:p-6                    /* More padding on larger screens */
    ">
      {/* Grid layout that adapts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatBox label="Gold" value="1,234" />
        <StatBox label="Level" value="15" />
      </div>
      
      {/* Stack vertically on mobile, horizontal on desktop */}
      <div className="flex flex-col lg:flex-row gap-4 mt-4">
        <Button>Trade</Button>
        <Button>Inventory</Button>
      </div>
    </div>
  );
}
```

### Loading States

**RULE**: Always show loading states for async operations.

```tsx
function TradePanel() {
  const { data: operations, isLoading, error } = useQuery(
    'activeOperations',
    fetchActiveOperations
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="large" />
        <p className="ml-4 text-gray-400">Loading operations...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-500 rounded p-4">
        <p className="text-red-200">Failed to load operations</p>
        <Button onClick={() => refetch()} className="mt-2">
          Try Again
        </Button>
      </div>
    );
  }

  // Empty state
  if (operations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 mb-4">No active operations</p>
        <Button onClick={() => navigate('/trade')}>
          Start Trading
        </Button>
      </div>
    );
  }

  // Success state
  return (
    <div>
      {operations.map(op => (
        <OperationCard key={op.id} operation={op} />
      ))}
    </div>
  );
}
```

### Accessibility

**RULE**: All interactive elements must be keyboard-accessible and have proper ARIA labels.

```tsx
function Button({ 
  children, 
  onClick, 
  disabled, 
  loading,
  ariaLabel 
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel || children}
      aria-busy={loading}
      className="
        px-4 py-2 rounded
        bg-blue-600 hover:bg-blue-700
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-blue-500
        transition-colors
      "
    >
      {loading ? (
        <>
          <Spinner className="inline mr-2" />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

// Modal with proper focus trap
function Modal({ isOpen, onClose, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus first interactive element
      modalRef.current?.focus();
      
      // Trap focus within modal
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal content */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative bg-gray-800 rounded-lg p-6 max-w-md w-full"
      >
        {children}
      </div>
    </div>
  );
}
```

---

## Testing Requirements

### Unit Test Template

**RULE**: All services and utilities must have unit tests with 80%+ coverage.

```typescript
// server/src/tests/unit/trading.service.test.ts
import { TradingService } from '../../services/trading.service';
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(),
}));

describe('TradingService', () => {
  let tradingService: TradingService;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    tradingService = new TradingService(prisma);
  });

  afterEach(() => {
    mockReset(prisma);
  });

  describe('startOperation', () => {
    it('should create a new trading operation successfully', async () => {
      // Arrange
      const playerId = 'player-123';
      const mockPlayer = {
        id: playerId,
        energy: 100,
        gold: BigInt(1000),
        inJail: false,
      };
      
      prisma.player.findUnique.mockResolvedValue(mockPlayer as any);
      prisma.$transaction.mockImplementation(async (callback) => {
        return callback(prisma);
      });

      // Act
      const result = await tradingService.startOperation(
        playerId,
        'SimpleTrade',
        [{ itemId: 'item-1', quantity: 1 }],
        'Kingdom1'
      );

      // Assert
      expect(result).toBeDefined();
      expect(prisma.tradingOperation.create).toHaveBeenCalled();
    });

    it('should throw error if player has insufficient energy', async () => {
      // Arrange
      const mockPlayer = {
        energy: 5, // Not enough for trade
        gold: BigInt(1000),
        inJail: false,
      };
      
      prisma.player.findUnique.mockResolvedValue(mockPlayer as any);

      // Act & Assert
      await expect(
        tradingService.startOperation(
          'player-123',
          'SimpleTrade',
          [{ itemId: 'item-1', quantity: 1 }],
          'Kingdom1'
        )
      ).rejects.toThrow('Not enough energy');
    });

    it('should throw error if player is in jail', async () => {
      // Arrange
      const mockPlayer = {
        energy: 100,
        gold: BigInt(1000),
        inJail: true,
        jailUntil: new Date(Date.now() + 60000),
      };
      
      prisma.player.findUnique.mockResolvedValue(mockPlayer as any);

      // Act & Assert
      await expect(
        tradingService.startOperation(
          'player-123',
          'SimpleTrade',
          [{ itemId: 'item-1', quantity: 1 }],
          'Kingdom1'
        )
      ).rejects.toThrow('Cannot trade while in jail');
    });
  });

  describe('completeOperation', () => {
    it('should complete operation and award profit on success', async () => {
      // Test implementation
    });

    it('should send player to jail if smuggling operation caught', async () => {
      // Test implementation
    });

    it('should reject if operation not ready yet', async () => {
      // Test implementation
    });
  });
});
```

### Integration Test Example

```typescript
// server/src/tests/integration/trading.test.ts
import request from 'supertest';
import { app } from '../../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Trading API Integration Tests', () => {
  let authToken: string;
  let playerId: string;

  beforeAll(async () => {
    // Setup test database
    await prisma.$connect();
    
    // Create test user and login
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'Test123!',
      });
    
    authToken = response.body.data.accessToken;
    playerId = response.body.data.user.player.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.deleteMany({
      where: { email: 'test@example.com' },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/trading/start', () => {
    it('should start a trading operation', async () => {
      const response = await request(app)
        .post('/api/trading/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          operationType: 'SimpleTrade',
          items: [{ itemId: 'some-item-id', quantity: 1 }],
          fromKingdom: 'Kingdom1',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/trading/start')
        .send({
          operationType: 'SimpleTrade',
          items: [],
          fromKingdom: 'Kingdom1',
        });

      expect(response.status).toBe(401);
    });

    it('should return 400 with invalid data', async () => {
      const response = await request(app)
        .post('/api/trading/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          operationType: 'InvalidType',
          items: [],
        });

      expect(response.status).toBe(400);
    });
  });
});
```

---

## Git Workflow

### Branch Naming

**RULE**: Use descriptive branch names with prefixes.

```
feature/guild-system
feature/market-prices
bugfix/energy-regen-calculation
bugfix/inventory-duplication
hotfix/critical-security-patch
refactor/trading-service
chore/update-dependencies
docs/api-documentation
```

### Commit Messages

**RULE**: Follow conventional commits format.

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring
- `perf`: Performance improvement
- `test`: Adding tests
- `docs`: Documentation
- `chore`: Maintenance tasks
- `style`: Code formatting

**Examples**:
```
feat(trading): Add black market operations

Implement high-risk black market trading with:
- 100% profit potential
- Jail system for caught players
- Dynamic risk calculation based on stats

Closes #123

---

fix(energy): Correct energy regeneration timing

Energy was regenerating too fast due to incorrect
minute calculation. Now properly regenerates 1 per minute.

Fixes #456

---

perf(market): Cache price data with Redis

Implement Redis caching for market prices to reduce
database load. Prices now update every 5 minutes
instead of real-time queries.

- Add CacheService
- Update MarketService to use cache
- Set 5-minute TTL for price data

Performance impact: 90% reduction in DB queries
```

### Pull Request Template

**RULE**: All PRs must include this information.

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code sections
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
- [ ] Dependent changes merged

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #123
Relates to #456
```

---

## Performance Standards

### Database Query Optimization

**RULE**: Always use proper indexes and avoid N+1 queries.

**❌ BAD** (N+1 query problem):
```typescript
// Loads players
const players = await prisma.player.findMany();

// Then loads guild for EACH player (N additional queries!)
for (const player of players) {
  const guild = await prisma.guild.findUnique({
    where: { id: player.guildId },
  });
  console.log(player.name, guild?.name);
}
```

**✅ GOOD** (Single query with include):
```typescript
const players = await prisma.player.findMany({
  include: {
    guild: true, // Loaded in single query
  },
});

// All data available immediately
players.forEach(player => {
  console.log(player.name, player.guild?.name);
});
```

### Frontend Performance

**RULE**: Optimize renders with React.memo and useMemo.

```typescript
// Expensive calculation
const ExpensiveComponent = React.memo(({ data }: Props) => {
  // Only recalculates if data changes
  const processedData = useMemo(() => {
    return complexCalculation(data);
  }, [data]);

  return <div>{processedData}</div>;
});

// Prevent unnecessary re-renders
const MemoizedList = React.memo(({ items }: { items: Item[] }) => {
  return (
    <ul>
      {items.map(item => (
        <MemoizedListItem key={item.id} item={item} />
      ))}
    </ul>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if items actually changed
  return prevProps.items === nextProps.items;
});
```

### Bundle Size Optimization

**RULE**: Use code splitting for large features.

```typescript
// Lazy load heavy components
const GuildPanel = lazy(() => import('@/components/game/GuildPanel'));
const MarketBoard = lazy(() => import('@/components/game/MarketBoard'));

function Dashboard() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/guild" element={<GuildPanel />} />
        <Route path="/market" element={<MarketBoard />} />
      </Routes>
    </Suspense>
  );
}

// Tree-shake unused imports
import { formatGold } from '@/utils/formatters'; // Only imports this function
// Instead of:
import * as formatters from '@/utils/formatters'; // Imports everything
```

---

## Anti-Cheat Development

### Server-Side Validation

**RULE**: NEVER trust the client. All calculations happen server-side.

**❌ BAD** (Client sends profit amount - exploitable):
```typescript
// CLIENT
const profit = calculateProfit(operation); // CLIENT calculates
await api.completeOperation(operationId, profit); // Sends to server

// SERVER (trusts client)
app.post('/complete', (req, res) => {
  const { profit } = req.body;
  await addGold(playerId, profit); // EXPLOITABLE!
});
```

**✅ GOOD** (Server calculates everything):
```typescript
// CLIENT (only sends operation ID)
await api.completeOperation(operationId);

// SERVER (calculates and validates)
app.post('/complete', async (req, res) => {
  const { operationId } = req.body;
  
  const operation = await getOperation(operationId);
  
  // Verify ownership
  if (operation.playerId !== req.user.playerId) {
    throw new Error('Unauthorized');
  }
  
  // Verify timing (can't complete early)
  if (operation.completesAt > new Date()) {
    throw new Error('Operation not ready');
  }
  
  // SERVER calculates profit (client can't manipulate)
  const profit = calculateProfit(operation);
  
  await addGold(req.user.playerId, profit);
});
```

### Rate Limiting

**RULE**: Prevent spam and automated attacks with rate limits.

```typescript
// Different limits for different actions
export const rateLimits = {
  // General API
  general: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }),
  
  // Auth (more strict)
  auth: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
  }),
  
  // Trading (prevent spam)
  trading: rateLimit({
    windowMs: 60 * 1000,
    max: 10,
  }),
  
  // Market listings
  marketplace: rateLimit({
    windowMs: 60 * 1000,
    max: 20,
  }),
  
  // Messages (prevent spam)
  messaging: rateLimit({
    windowMs: 60 * 1000,
    max: 5,
  }),
};
```

### Activity Logging

**RULE**: Log all significant actions for audit trail.

```typescript
async function logActivity(
  playerId: string,
  action: string,
  details: any,
  ipAddress: string
) {
  await prisma.activityLog.create({
    data: {
      playerId,
      action,
      details,
      ipAddress,
    },
  });
  
  // Also check for suspicious patterns
  await antiCheatService.analyzeActivity(playerId, action);
}

// Usage throughout the app
await logActivity(playerId, 'TRADE_STARTED', { operationId }, req.ip);
await logActivity(playerId, 'GOLD_EARNED', { amount: 1000 }, req.ip);
await logActivity(playerId, 'GUILD_JOINED', { guildId }, req.ip);
```

---

## Code Review Checklist

Before submitting a PR, verify:

### Functionality
- [ ] Feature works as intended
- [ ] Edge cases handled
- [ ] Error cases handled
- [ ] No console errors or warnings

### Code Quality
- [ ] Follows naming conventions
- [ ] No code duplication (DRY)
- [ ] Functions are focused (SRP)
- [ ] Comments explain WHY, not WHAT
- [ ] Complex logic is explained

### Security
- [ ] Input validation on all endpoints
- [ ] Authentication required where needed
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] Rate limiting implemented
- [ ] Sensitive data not exposed

### Performance
- [ ] No N+1 queries
- [ ] Proper database indexes used
- [ ] Large lists virtualized
- [ ] Images optimized
- [ ] Bundle size checked

### Testing
- [ ] Unit tests for services
- [ ] Integration tests for APIs
- [ ] Edge cases tested
- [ ] Error cases tested
- [ ] 80%+ code coverage

### UI/UX
- [ ] Mobile responsive
- [ ] Loading states shown
- [ ] Error states handled
- [ ] Empty states handled
- [ ] Accessibility standards met
- [ ] Keyboard navigation works

### Documentation
- [ ] README updated if needed
- [ ] API docs updated
- [ ] Complex features documented
- [ ] Breaking changes noted

---

## Common Patterns

### API Call Pattern (Frontend)

```typescript
// api/trading.api.ts
import axios from 'axios';
import { getAuthHeaders } from './auth.api';

export const tradingAPI = {
  async startOperation(data: StartOperationData) {
    const response = await axios.post(
      '/api/trading/start',
      data,
      { headers: getAuthHeaders() }
    );
    return response.data.data;
  },

  async getActiveOperations() {
    const response = await axios.get(
      '/api/trading/active',
      { headers: getAuthHeaders() }
    );
    return response.data.data;
  },
};

// Usage in component with React Query
function TradingPanel() {
  const { data, isLoading, error } = useQuery(
    'activeOperations',
    tradingAPI.getActiveOperations,
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  const startTradeMutation = useMutation(
    tradingAPI.startOperation,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('activeOperations');
        toast.success('Trade started!');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Trade failed');
      },
    }
  );

  return (
    // Component JSX
  );
}
```

### Service Pattern (Backend)

```typescript
// Pattern for all services
export class ServiceName {
  // Constructor if needed
  constructor(private prisma: PrismaClient) {}

  // Public methods (called by controllers)
  async publicMethod(input: Type): Promise<ReturnType> {
    // 1. Validate inputs
    this.validateInput(input);
    
    // 2. Check permissions/requirements
    await this.checkRequirements(input);
    
    // 3. Perform operation (in transaction if multiple steps)
    const result = await this.prisma.$transaction(async (tx) => {
      const data = await this.performOperation(tx, input);
      await this.logAction(tx, input);
      return data;
    });
    
    // 4. Return result
    return result;
  }

  // Private helper methods
  private validateInput(input: Type): void {
    if (!input) throw new Error('Invalid input');
  }

  private async checkRequirements(input: Type): Promise<void> {
    // Verify player has permission, resources, etc.
  }

  private async performOperation(tx: any, input: Type): Promise<any> {
    // Main logic
  }

  private async logAction(tx: any, input: Type): Promise<void> {
    // Activity logging
  }
}
```

---

## Final Notes

### Development Workflow Summary

1. **Start new feature**:
   - Create branch: `git checkout -b feature/name`
   - Implement with tests
   - Run linter: `npm run lint`
   - Run tests: `npm test`
   - Commit with conventional format

2. **Before PR**:
   - Review code review checklist
   - Ensure all tests pass
   - Update documentation
   - Test on mobile and desktop
   - Verify security considerations

3. **After PR approval**:
   - Squash and merge
   - Delete branch
   - Deploy to staging
   - Test on staging
   - Deploy to production

### Key Principles to Remember

✅ **Security First** - Every feature must be secure  
✅ **DRY** - Don't repeat yourself  
✅ **Type Safety** - Use TypeScript strictly  
✅ **Server Authority** - Never trust the client  
✅ **Mobile First** - Design for mobile, scale up  
✅ **Test Coverage** - 80%+ coverage required  
✅ **Performance** - Optimize from the start  
✅ **Accessibility** - Make it usable for everyone  
✅ **Documentation** - Explain complex decisions  
✅ **Consistency** - Follow established patterns  

---

**This guide is a living document. Update it as the project evolves and new patterns emerge.**
