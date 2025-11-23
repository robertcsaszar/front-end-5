# 🎮 Rogue Merchant Guild - Game Design Document

## Executive Summary

**Title**: Rogue Merchant Guild  
**Genre**: Browser-based Trading/Strategy MMO  
**Setting**: Medieval Fantasy  
**Target Audience**: 16+ strategy and trading game enthusiasts  
**Platform**: Web (Desktop & Mobile)  
**Monetization**: Free-to-play with optional premium membership (cosmetic/convenience only)

## Core Concept

Players build a merchant empire from nothing, navigating the fine line between legitimate business and questionable practices. Rise through 15 ranks by trading goods, managing risk, forming alliances, and competing for economic dominance.

---

## Game Pillars

### 1. Strategic Trading
Players make informed decisions about what to buy, where to sell, and which risks to take.

### 2. Risk vs Reward
Higher-risk operations (smuggling, black market) offer greater profits but carry consequences (jail time, fines, reputation loss).

### 3. Economic Simulation
Dynamic market with supply/demand, player actions affecting prices, and random events creating opportunities.

### 4. Social Competition
Guilds, leaderboards, player trading, and economic warfare create competitive environment.

### 5. Long-term Progression
Building an empire takes time - players invest in properties, unlock features, and work toward prestigious ranks.

---

## Core Game Loop

### Minute-to-Minute (5-15 min session)
1. Check completed operations
2. Collect profits
3. Check market prices
4. Start new trades
5. Manage inventory
6. Chat with guild

### Daily (30-60 min session)
1. Complete daily quests
2. Multiple trading operations
3. Guild activities
4. Market speculation
5. Building upgrades
6. Check leaderboards

### Weekly
1. Guild wars
2. Special events
3. Auctions
4. Competition rankings
5. Strategic planning

---

## Progression Systems

### Player Levels (1-100+)
- Gain XP from successful trades
- Unlock new features and operations
- Increase maximum energy
- Improve base stats

### Merchant Ranks (15 tiers)
1. **Street Peddler** (Level 1) - Starting rank
2. **Market Vendor** (Level 3) - Own market stall
3. **Shop Owner** (Level 5) - Permanent shop
4. **Trader** (Level 7) - Multiple goods
5. **Merchant** (Level 10) - Import/export
6. **Master Merchant** (Level 15) - Trade routes
7. **Guild Member** (Level 20) - Join/form guilds
8. **Caravan Master** (Level 25) - Large operations
9. **Trade Baron** (Level 35) - Control districts
10. **Merchant Prince** (Level 45) - Influence nobility
11. **Spymaster Trader** (Level 55) - Espionage
12. **Black Market Lord** (Level 65) - Underground empire
13. **Economic Manipulator** (Level 75) - Crash markets
14. **Trade Magnate** (Level 85) - Cross-kingdom
15. **Merchant King** (Level 100) - Ultimate power

### Stats System
- **Cunning**: Better deals, avoid guards, spot opportunities
- **Charisma**: Negotiate prices, recruit allies, charm nobles
- **Intelligence**: Market predictions, recipe discoveries
- **Connections**: Unlock contacts, bribes work better
- **Luck**: Better loot drops, avoid disasters
- **Reputation**: Affects prices and access

Stats improve through:
- Level-ups grant stat points
- Equipment/items provide bonuses
- Guild perks
- Achievements

---

## Trading System

### Operation Types

#### 1. Simple Trade
- **Risk**: Low (95% success)
- **Profit**: 15%
- **Duration**: 5 minutes
- **Energy**: 10
- **Fail Consequence**: Lose investment

#### 2. Smuggling
- **Risk**: Medium (80% success)
- **Profit**: 50%
- **Duration**: 15 minutes
- **Energy**: 25
- **Fail Consequence**: Jail (30 min) + fine

#### 3. Black Market
- **Risk**: High (60% success)
- **Profit**: 100%
- **Duration**: 30 minutes
- **Energy**: 40
- **Fail Consequence**: Jail (2 hours) + large fine

#### 4. Caravan
- **Risk**: Medium (75% success)
- **Profit**: 200%
- **Duration**: 2 hours
- **Energy**: 50
- **Fail Consequence**: Lose shipment

### Market Economy

**Dynamic Pricing**:
- Base price per item
- Supply/demand modifiers
- Event modifiers (war, plague, festival)
- Player action effects (mass buying/selling)
- Kingdom-specific prices

**Item Categories**:
- **Common**: Food, cloth, tools (always tradeable, small margins)
- **Luxury**: Silk, jewelry, perfumes (high markup, volatile)
- **Contraband**: Illegal goods, forbidden items (highest profit, illegal)
- **Resources**: Ore, timber, stone (for building)
- **Special**: Rare items, dragon scales (extremely valuable)

**Market Events** (Random):
- War outbreak → weapon prices surge
- Plague → medicine prices skyrocket
- Harvest festival → food prices drop
- Noble wedding → luxury demand increases
- Bandit activity → caravan routes dangerous

---

## Energy System

### Mechanics
- **Starting energy**: 100
- **Maximum**: Increases with level (100 + level * 2)
- **Regeneration**: 1 per minute (always, even offline)
- **Usage**: All actions cost energy
- **Premium**: 2x regeneration speed

### Energy Costs
- Simple Trade: 10
- Smuggling: 25
- Black Market: 40
- Caravan: 50
- Guild activities: 15-30
- Crafting: 5-20

---

## Buildings & Properties

### Personal Buildings
Each building has 5 upgrade levels with increasing benefits.

#### 1. Market Stall
- **Cost**: 500 gold
- **Benefit**: +10 inventory space per level
- **Unlocks**: Level 1

#### 2. Shop
- **Cost**: 2,000 gold
- **Benefit**: Passive income + 20 inventory
- **Unlocks**: Level 5

#### 3. Warehouse
- **Cost**: 5,000 gold
- **Benefit**: +50 inventory, reduce loss risk
- **Unlocks**: Level 10

#### 4. Tavern
- **Cost**: 10,000 gold
- **Benefit**: Gather intel, recruit smugglers
- **Unlocks**: Level 15

#### 5. Black Market Den
- **Cost**: 25,000 gold
- **Benefit**: Access illegal goods, fence stolen items
- **Unlocks**: Level 25

#### 6. Caravan Company
- **Cost**: 50,000 gold
- **Benefit**: Run multiple caravans simultaneously
- **Unlocks**: Level 30

#### 7. Spy Network
- **Cost**: 100,000 gold
- **Benefit**: Sabotage rivals, steal secrets
- **Unlocks**: Level 40

#### 8. Noble Estate
- **Cost**: 250,000 gold
- **Benefit**: Political influence, prestige
- **Unlocks**: Level 50

---

## Guild System

### Guild Creation
- **Cost**: 10,000 gold
- **Requirements**: Level 20
- **Initial slots**: 10 members
- **Upgradeable**: Yes

### Guild Features
- **Shared warehouse**: Pool resources
- **Guild bank**: Treasury for operations
- **Guild quests**: Cooperative missions
- **Territory control**: Compete for districts
- **Guild wars**: Economic battles
- **Perks tree**: Unlock bonuses

### Guild Ranks
1. **Initiate** - New member
2. **Member** - Full access
3. **Officer** - Moderate permissions
4. **Council** - High permissions
5. **Guildmaster** - Full control

### Guild Activities

#### Monopoly Operations
Guilds coordinate to control entire markets:
- Buy up supply
- Fix prices
- Squeeze out competition

#### Heists
Large cooperative operations:
- Royal treasury
- Noble estates
- Rival warehouses
- Requires multiple members
- Massive rewards

#### Territory Wars
Compete for district control:
- Higher profits in owned districts
- Passive income
- Prestige
- Seasonal resets

---

## Social Features

### Player Interactions
- **Direct trading**: Buy/sell with players
- **Messaging**: Private messages
- **Alliances**: Non-guild partnerships
- **Rivalries**: Declare rivals for bonuses
- **Mentorship**: Veterans guide newbies

### Leaderboards
- **Wealth**: Total gold
- **Level**: Player level
- **Reputation**: Influence score
- **Guild power**: Guild rankings
- **Seasonal**: Weekly/monthly competitions

### Chat System
- **Global**: All players
- **Guild**: Guild members only
- **Trade**: Market discussions
- **Whisper**: Private messages

---

## Monetization (Ethical F2P)

### Premium Membership ($5/month)
**Convenience Only - NOT Pay-to-Win**:
- 2x energy regeneration
- +20% inventory space
- Priority customer support
- Cosmetic shop items
- Name color customization
- Profile customization

### Cosmetics (Optional)
- Shop appearances
- Character portraits
- Title customization
- Badge collection
- Particle effects

### What You CANNOT Buy
- ❌ Gold directly
- ❌ Better success rates
- ❌ Stat boosts
- ❌ Exclusive powerful items
- ❌ Unfair advantages

---

## Content Updates

### Weekly
- Market event rotation
- Special trade opportunities
- Guild competitions

### Monthly
- New items
- New buildings
- Balance updates
- Bug fixes

### Quarterly
- New kingdoms
- Major features
- Seasonal events
- Story content

### Yearly
- Major expansions
- New game modes
- Complete overhauls

---

## Player Retention Hooks

### Short-term (Daily)
- Energy regeneration (log in to use)
- Daily quests/bonuses
- Market fluctuations
- Active operations

### Medium-term (Weekly)
- Guild wars
- Leaderboard rankings
- Special events
- Auction house

### Long-term (Months)
- Rank progression
- Building collection
- Achievement hunting
- Guild development
- Market domination

---

## Anti-Frustration Features

### No Pay-to-Win
All premium features are cosmetic or convenience. No gameplay advantages can be purchased.

### Offline Progress
- Energy continues regenerating
- Operations complete while offline
- No "wait or pay" mechanics

### Catch-up Mechanics
- Mentorship bonuses for helping newbies
- Bonus XP for lower-level players
- Starter packs for new players

### Forgiving Systems
- First-time jail is short
- Can recover from mistakes
- No permanent losses
- Guild support helps recovery

---

## Success Metrics

### Engagement
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Average session length: 30-45 minutes
- Sessions per day: 2-3

### Retention
- Day 1: 50%+
- Day 7: 30%+
- Day 30: 15%+

### Monetization
- Conversion rate: 3-5%
- ARPU: $0.50
- ARPPU: $10-15

### Social
- Guild membership: 60%+
- Player trades per day: 5,000+
- Messages sent: 10,000+

---

## Risk Mitigation

### Potential Issues

#### 1. Botting
**Solution**: 
- Server-side validation
- Pattern detection
- CAPTCHAs for suspicious activity
- Manual review system

#### 2. Alt Accounts
**Solution**:
- IP tracking
- Device fingerprinting
- Trade restrictions for new accounts
- Guild member limits

#### 3. Market Manipulation
**Solution**:
- Anti-monopoly mechanics
- Admin monitoring tools
- Price caps/floors
- Automatic balancing

#### 4. Inactive Players
**Solution**:
- Auto-logout systems
- Resource redistribution
- Comeback bonuses
- Guild activity requirements

---

## Future Expansion Ideas

### Year 1
- Mobile apps (iOS/Android)
- More kingdoms (5 → 10)
- Advanced guild features
- Seasonal events

### Year 2
- Player housing
- Crafting system
- Pet companions
- Skill trees

### Year 3
- Multi-kingdom wars
- Player-run cities
- Advanced politics
- Merchant dynasties

---

## Conclusion

Rogue Merchant Guild offers a unique blend of strategic trading, risk management, and social competition in a rich medieval fantasy setting. The game respects players' time and wallets while providing engaging long-term progression and a thriving player-driven economy.

**Key Differentiators**:
✅ Original medieval trading theme  
✅ Risk/reward decision-making  
✅ No pay-to-win monetization  
✅ Player-driven economy  
✅ Social guild features  
✅ Strategic depth  
✅ Mobile-friendly  
✅ Respects player time  

This is a game built for long-term engagement, community building, and fair competition.
