# 🔄 Rogue Merchant Guild - Hybrid Real-Time Implementation Guide

## Document Purpose

This document provides a **complete alternative architecture** that adds real-time multiplayer features to the game. Compare this with the initial `TECHNICAL_IMPLEMENTATION.md` (traditional async approach) to decide which direction fits your vision.

## 📊 Quick Comparison

| Aspect | Traditional Approach (Initial Doc) | Hybrid Real-Time (This Doc) |
|--------|-----------------------------------|----------------------------|
| **Player Presence** | Players don't "see" each other | Players see each other in social hubs |
| **Chat** | Refresh to see new messages | Instant live chat |
| **Market** | Refresh to see new listings | Listings appear instantly |
| **Guild Activity** | Check logs for updates | Live updates as they happen |
| **Technical Complexity** | ⭐⭐ Medium | ⭐⭐⭐⭐ High |
| **Server Cost** | Lower (HTTP only) | Higher (WebSocket + HTTP) |
| **Mobile Battery** | Better | Moderate (persistent connection) |
| **Social Feel** | Multiplayer but async | Feels like MMO |
| **Development Time** | 16 weeks | 20-24 weeks |

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [WebSocket Infrastructure](#websocket-infrastructure)
3. [Location System](#location-system)
4. [Real-Time Features](#real-time-features)
5. [Database Changes](#database-changes)
6. [Frontend Implementation](#frontend-implementation)
7. [Backend Implementation](#backend-implementation)
8. [Performance & Scaling](#performance--scaling)
9. [Security Considerations](#security-considerations)
10. [Migration from Traditional](#migration-from-traditional)

---

## Architecture Overview

### Hybrid Model Explained

```
┌─────────────────────────────────────────────────────────────┐
│                    HYBRID ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Traditional REST API (70% of game)                          │
│  ├── Trading operations                                      │
│  ├── Inventory management                                    │
│  ├── Building purchases                                      │
│  ├── Player progression                                      │
│  └── Most game mechanics                                     │
│                                                              │
│  Real-Time WebSocket (30% of game)                           │
│  ├── Social hubs (Tavern, Guild Hall)                        │
│  ├── Live chat (global, location, guild, private)           │
│  ├── Market updates (new listings, sales)                    │
│  ├── Notifications (trades complete, events)                │
│  ├── Live events (coordinated heists, wars)                  │
│  └── Player presence tracking                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack Addition

**New Dependencies:**

```json
// server/package.json additions
{
  "dependencies": {
    "socket.io": "^4.6.0",           // WebSocket server
    "ioredis": "^5.3.0",             // Redis for pub/sub (already in base)
    "@socket.io/redis-adapter": "^8.2.1"  // Scale across multiple servers
  }
}

// client/package.json additions
{
  "dependencies": {
    "socket.io-client": "^4.6.0"     // WebSocket client (already in base)
  }
}
```

---

## WebSocket Infrastructure

### Server Setup

#### Step 1: WebSocket Server Configuration

```typescript
// server/src/websocket/socket.ts
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { verifySocketAuth } from './middleware/socketAuth';
import { LocationManager } from './managers/LocationManager';
import { ChatManager } from './managers/ChatManager';
import { NotificationManager } from './managers/NotificationManager';

export class WebSocketServer {
  private io: SocketIOServer;
  private locationManager: LocationManager;
  private chatManager: ChatManager;
  private notificationManager: NotificationManager;

  constructor(httpServer: HTTPServer) {
    // Initialize Socket.IO
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
      },
      // Connection settings
      pingTimeout: 60000,
      pingInterval: 25000,
      transports: ['websocket', 'polling'], // Fallback to polling if needed
    });

    // Redis adapter for scaling across multiple servers
    this.setupRedisAdapter();

    // Initialize managers
    this.locationManager = new LocationManager(this.io);
    this.chatManager = new ChatManager(this.io);
    this.notificationManager = new NotificationManager(this.io);

    // Setup authentication middleware
    this.io.use(verifySocketAuth);

    // Setup event handlers
    this.setupEventHandlers();

    console.log('✅ WebSocket server initialized');
  }

  /**
   * Setup Redis adapter for horizontal scaling
   * Allows multiple server instances to communicate
   */
  private async setupRedisAdapter() {
    const pubClient = createClient({ 
      url: process.env.REDIS_URL || 'redis://localhost:6379' 
    });
    const subClient = pubClient.duplicate();

    await Promise.all([
      pubClient.connect(),
      subClient.connect(),
    ]);

    this.io.adapter(createAdapter(pubClient, subClient));
    
    console.log('✅ Redis adapter connected');
  }

  /**
   * Setup main event handlers
   */
  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const userId = socket.data.userId;
      const playerId = socket.data.playerId;

      console.log(`[WS] Player ${playerId} connected (socket: ${socket.id})`);

      // Join player's personal room for targeted notifications
      socket.join(`player:${playerId}`);

      // Track connection in Redis for presence
      this.trackConnection(playerId, socket.id);

      // ========================================
      // LOCATION EVENTS
      // ========================================
      
      socket.on('location:join', async (data: { location: string }) => {
        try {
          const players = await this.locationManager.joinLocation(
            playerId,
            data.location,
            socket
          );
          
          // Send current players in location to new joiner
          socket.emit('location:players', { 
            location: data.location,
            players 
          });
        } catch (error) {
          socket.emit('error', { message: 'Failed to join location' });
        }
      });

      socket.on('location:leave', async (data: { location: string }) => {
        await this.locationManager.leaveLocation(playerId, data.location);
      });

      // ========================================
      // CHAT EVENTS
      // ========================================

      socket.on('chat:send', async (data: {
        channel: string;
        message: string;
        location?: string;
      }) => {
        try {
          await this.chatManager.sendMessage({
            playerId,
            channel: data.channel,
            message: data.message,
            location: data.location,
          });
        } catch (error) {
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      socket.on('chat:typing', (data: { channel: string; location?: string }) => {
        this.chatManager.broadcastTyping(
          playerId,
          data.channel,
          data.location
        );
      });

      // ========================================
      // GUILD EVENTS
      // ========================================

      socket.on('guild:activity', async (data: {
        activityType: string;
        details: any;
      }) => {
        // Broadcast to guild members
        const guildId = await this.getPlayerGuild(playerId);
        if (guildId) {
          this.io.to(`guild:${guildId}`).emit('guild:update', {
            playerId,
            activityType: data.activityType,
            details: data.details,
            timestamp: Date.now(),
          });
        }
      });

      // ========================================
      // MARKET EVENTS
      // ========================================

      socket.on('market:watch', (data: { itemId: string }) => {
        // Subscribe to item price updates
        socket.join(`market:item:${data.itemId}`);
      });

      socket.on('market:unwatch', (data: { itemId: string }) => {
        socket.leave(`market:item:${data.itemId}`);
      });

      // ========================================
      // TRADING EVENTS (Status updates)
      // ========================================

      socket.on('trading:subscribe', () => {
        // Subscribe to player's trading operation updates
        socket.join(`trading:${playerId}`);
      });

      // ========================================
      // DISCONNECT
      // ========================================

      socket.on('disconnect', async () => {
        console.log(`[WS] Player ${playerId} disconnected`);
        
        // Remove from all locations
        await this.locationManager.removePlayer(playerId);
        
        // Track disconnection
        await this.trackDisconnection(playerId, socket.id);
      });
    });
  }

  /**
   * Track player connection in Redis for presence system
   */
  private async trackConnection(playerId: string, socketId: string) {
    await redisClient.hSet(`player:${playerId}:connection`, {
      socketId,
      connectedAt: Date.now(),
      lastSeen: Date.now(),
    });
    
    // Set online status
    await redisClient.set(`player:${playerId}:online`, '1', 'EX', 300); // 5 min expiry
  }

  /**
   * Track player disconnection
   */
  private async trackDisconnection(playerId: string, socketId: string) {
    await redisClient.del(`player:${playerId}:connection`);
    await redisClient.set(`player:${playerId}:online`, '0');
    await redisClient.set(`player:${playerId}:lastSeen`, Date.now());
  }

  /**
   * Get player's guild ID
   */
  private async getPlayerGuild(playerId: string): Promise<string | null> {
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      select: { guildId: true },
    });
    return player?.guildId || null;
  }

  /**
   * Public methods for broadcasting from other services
   */

  public sendNotification(playerId: string, notification: any) {
    this.io.to(`player:${playerId}`).emit('notification', notification);
  }

  public broadcastToGuild(guildId: string, event: string, data: any) {
    this.io.to(`guild:${guildId}`).emit(event, data);
  }

  public broadcastMarketUpdate(itemId: string, data: any) {
    this.io.to(`market:item:${itemId}`).emit('market:update', data);
  }

  public broadcastGlobalEvent(event: string, data: any) {
    this.io.emit(event, data);
  }
}

// Export singleton instance
let wsServer: WebSocketServer;

export function initializeWebSocketServer(httpServer: HTTPServer): WebSocketServer {
  if (!wsServer) {
    wsServer = new WebSocketServer(httpServer);
  }
  return wsServer;
}

export function getWebSocketServer(): WebSocketServer {
  if (!wsServer) {
    throw new Error('WebSocket server not initialized');
  }
  return wsServer;
}
```

#### Step 2: Authentication Middleware

```typescript
// server/src/websocket/middleware/socketAuth.ts
import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { config } from '../../config/environment';

const prisma = new PrismaClient();

/**
 * Authenticate WebSocket connections
 * Verifies JWT token and attaches user data to socket
 */
export async function verifySocketAuth(socket: Socket, next: (err?: Error) => void) {
  try {
    // Get token from handshake auth or query
    const token = 
      socket.handshake.auth.token || 
      socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    // Verify JWT
    const decoded = jwt.verify(token, config.jwtSecret) as any;

    // Get user and player data
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        player: {
          select: {
            id: true,
            level: true,
            guildId: true,
            banned: true,
            bannedUntil: true,
          },
        },
      },
    });

    if (!user || !user.player) {
      return next(new Error('Invalid authentication token'));
    }

    // Check if banned
    if (user.player.banned) {
      if (user.player.bannedUntil && user.player.bannedUntil > new Date()) {
        return next(new Error('Account is banned'));
      }
    }

    // Attach user data to socket
    socket.data.userId = user.id;
    socket.data.playerId = user.player.id;
    socket.data.guildId = user.player.guildId;

    // Join guild room if in guild
    if (user.player.guildId) {
      socket.join(`guild:${user.player.guildId}`);
    }

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new Error('Token expired'));
    } else {
      next(new Error('Authentication failed'));
    }
  }
}
```

#### Step 3: Integrate with Express

```typescript
// server/src/server.ts
import express from 'express';
import { createServer } from 'http';
import { initializeWebSocketServer } from './websocket/socket';
import routes from './routes';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api', routes);

// Create HTTP server
const httpServer = createServer(app);

// Initialize WebSocket server
const wsServer = initializeWebSocketServer(httpServer);

// Export for use in services
export { wsServer };

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 WebSocket server ready`);
});
```

---

## Location System

### Location Manager

```typescript
// server/src/websocket/managers/LocationManager.ts
import { Server as SocketIOServer, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { redisClient } from '../../config/redis';

const prisma = new PrismaClient();

interface PlayerInLocation {
  playerId: string;
  username: string;
  level: number;
  rank: string;
  guildTag?: string;
  joinedAt: number;
}

/**
 * Manages player presence in different game locations
 * Locations: tavern, guild_hall, market, arena
 */
export class LocationManager {
  private io: SocketIOServer;
  
  // In-memory cache for quick lookups (also in Redis for persistence)
  private locations: Map<string, Map<string, PlayerInLocation>> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
    
    // Initialize common locations
    const commonLocations = ['tavern', 'market', 'guild_hall', 'arena'];
    commonLocations.forEach(loc => {
      this.locations.set(loc, new Map());
    });
  }

  /**
   * Player joins a location
   * Returns list of players already in that location
   */
  async joinLocation(
    playerId: string, 
    location: string, 
    socket: Socket
  ): Promise<PlayerInLocation[]> {
    // Validate location
    const validLocations = ['tavern', 'market', 'guild_hall', 'arena'];
    if (!validLocations.includes(location)) {
      throw new Error('Invalid location');
    }

    // Get player data
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        user: { select: { username: true } },
        guild: { select: { tag: true } },
      },
    });

    if (!player) throw new Error('Player not found');

    const playerData: PlayerInLocation = {
      playerId: player.id,
      username: player.user.username,
      level: player.level,
      rank: player.rank,
      guildTag: player.guild?.tag,
      joinedAt: Date.now(),
    };

    // Add to location map
    if (!this.locations.has(location)) {
      this.locations.set(location, new Map());
    }
    this.locations.get(location)!.set(playerId, playerData);

    // Join Socket.IO room
    socket.join(`location:${location}`);

    // Store in Redis for persistence across server restarts
    await redisClient.hSet(
      `location:${location}`,
      playerId,
      JSON.stringify(playerData)
    );

    // Set expiry (auto-cleanup if player disconnects ungracefully)
    await redisClient.expire(`location:${location}`, 3600); // 1 hour

    // Broadcast to others in location
    socket.to(`location:${location}`).emit('location:player_joined', {
      location,
      player: playerData,
    });

    console.log(`[Location] Player ${player.user.username} joined ${location}`);

    // Return current players in location
    const playersInLocation = Array.from(this.locations.get(location)!.values());
    return playersInLocation;
  }

  /**
   * Player leaves a location
   */
  async leaveLocation(playerId: string, location: string): Promise<void> {
    // Remove from map
    this.locations.get(location)?.delete(playerId);

    // Remove from Redis
    await redisClient.hDel(`location:${location}`, playerId);

    // Broadcast to others
    this.io.to(`location:${location}`).emit('location:player_left', {
      location,
      playerId,
      timestamp: Date.now(),
    });

    console.log(`[Location] Player ${playerId} left ${location}`);
  }

  /**
   * Remove player from all locations (on disconnect)
   */
  async removePlayer(playerId: string): Promise<void> {
    const locations = ['tavern', 'market', 'guild_hall', 'arena'];
    
    for (const location of locations) {
      if (this.locations.get(location)?.has(playerId)) {
        await this.leaveLocation(playerId, location);
      }
    }
  }

  /**
   * Get players in a location
   */
  async getPlayersInLocation(location: string): Promise<PlayerInLocation[]> {
    // First check memory
    const fromMemory = this.locations.get(location);
    if (fromMemory) {
      return Array.from(fromMemory.values());
    }

    // Fallback to Redis
    const fromRedis = await redisClient.hGetAll(`location:${location}`);
    const players = Object.values(fromRedis).map(data => JSON.parse(data));
    
    return players;
  }

  /**
   * Get player's current location
   */
  async getPlayerLocation(playerId: string): Promise<string | null> {
    const locations = ['tavern', 'market', 'guild_hall', 'arena'];
    
    for (const location of locations) {
      if (this.locations.get(location)?.has(playerId)) {
        return location;
      }
    }
    
    return null;
  }

  /**
   * Get player count per location (for UI)
   */
  async getLocationCounts(): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    
    for (const [location, players] of this.locations) {
      counts[location] = players.size;
    }
    
    return counts;
  }

  /**
   * Broadcast message to all players in a location
   */
  broadcastToLocation(location: string, event: string, data: any): void {
    this.io.to(`location:${location}`).emit(event, data);
  }
}
```

---

## Real-Time Features

### Chat System

```typescript
// server/src/websocket/managers/ChatManager.ts
import { Server as SocketIOServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { redisClient } from '../../config/redis';
import { sanitizeHTML } from '../../utils/sanitize';

const prisma = new PrismaClient();

interface ChatMessage {
  id: string;
  playerId: string;
  username: string;
  guildTag?: string;
  channel: string;
  location?: string;
  message: string;
  timestamp: number;
}

/**
 * Manages real-time chat across different channels
 * Channels: global, trade, guild, location, private
 */
export class ChatManager {
  private io: SocketIOServer;
  
  // Rate limiting: player -> last message timestamp
  private lastMessageTime: Map<string, number> = new Map();
  private messageInterval = 1000; // 1 second between messages

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  /**
   * Send a chat message
   */
  async sendMessage(data: {
    playerId: string;
    channel: string;
    message: string;
    location?: string;
    recipientId?: string; // For private messages
  }): Promise<void> {
    // Rate limiting
    const lastTime = this.lastMessageTime.get(data.playerId) || 0;
    const now = Date.now();
    
    if (now - lastTime < this.messageInterval) {
      throw new Error('Sending messages too fast');
    }
    
    this.lastMessageTime.set(data.playerId, now);

    // Get player info
    const player = await prisma.player.findUnique({
      where: { id: data.playerId },
      include: {
        user: { select: { username: true } },
        guild: { select: { tag: true } },
      },
    });

    if (!player) throw new Error('Player not found');

    // Check if player is muted
    const isMuted = await this.checkMuted(data.playerId);
    if (isMuted) {
      throw new Error('You are muted');
    }

    // Sanitize message (prevent XSS)
    const sanitizedMessage = sanitizeHTML(data.message);

    // Validate message length
    if (sanitizedMessage.length < 1 || sanitizedMessage.length > 500) {
      throw new Error('Message must be 1-500 characters');
    }

    // Create message object
    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      playerId: player.id,
      username: player.user.username,
      guildTag: player.guild?.tag,
      channel: data.channel,
      location: data.location,
      message: sanitizedMessage,
      timestamp: Date.now(),
    };

    // Broadcast based on channel type
    switch (data.channel) {
      case 'global':
        // Broadcast to everyone
        this.io.emit('chat:message', chatMessage);
        break;

      case 'trade':
        // Broadcast to everyone (trade channel)
        this.io.emit('chat:message', chatMessage);
        break;

      case 'guild':
        // Broadcast to guild members only
        if (!player.guildId) {
          throw new Error('Not in a guild');
        }
        this.io.to(`guild:${player.guildId}`).emit('chat:message', chatMessage);
        break;

      case 'location':
        // Broadcast to location (tavern, market, etc.)
        if (!data.location) {
          throw new Error('Location required');
        }
        this.io.to(`location:${data.location}`).emit('chat:message', chatMessage);
        break;

      case 'private':
        // Private message to specific player
        if (!data.recipientId) {
          throw new Error('Recipient required');
        }
        // Send to both sender and recipient
        this.io.to(`player:${data.recipientId}`).emit('chat:message', chatMessage);
        this.io.to(`player:${data.playerId}`).emit('chat:message', chatMessage);
        
        // Store in database for history
        await this.storePrivateMessage(
          data.playerId,
          data.recipientId,
          sanitizedMessage
        );
        break;

      default:
        throw new Error('Invalid channel');
    }

    // Store in Redis for recent message history (last 100 messages per channel)
    await this.storeMessageInHistory(data.channel, chatMessage);

    // Log for moderation
    await this.logMessage(chatMessage);

    console.log(`[Chat] ${player.user.username} in ${data.channel}: ${sanitizedMessage.substring(0, 50)}`);
  }

  /**
   * Broadcast typing indicator
   */
  broadcastTyping(playerId: string, channel: string, location?: string): void {
    const room = location ? `location:${location}` : 'global';
    
    this.io.to(room).emit('chat:typing', {
      playerId,
      channel,
      location,
      timestamp: Date.now(),
    });
  }

  /**
   * Get recent messages from a channel
   */
  async getRecentMessages(
    channel: string, 
    location?: string, 
    limit: number = 50
  ): Promise<ChatMessage[]> {
    const key = location 
      ? `chat:${channel}:${location}` 
      : `chat:${channel}`;
    
    const messages = await redisClient.lRange(key, 0, limit - 1);
    return messages.map(msg => JSON.parse(msg));
  }

  /**
   * Store message in Redis history
   */
  private async storeMessageInHistory(
    channel: string, 
    message: ChatMessage
  ): Promise<void> {
    const key = message.location 
      ? `chat:${channel}:${message.location}` 
      : `chat:${channel}`;
    
    // Add to list (newest first)
    await redisClient.lPush(key, JSON.stringify(message));
    
    // Keep only last 100 messages
    await redisClient.lTrim(key, 0, 99);
    
    // Set expiry (auto-cleanup old channels)
    await redisClient.expire(key, 3600); // 1 hour
  }

  /**
   * Store private message in database
   */
  private async storePrivateMessage(
    senderId: string,
    recipientId: string,
    message: string
  ): Promise<void> {
    await prisma.message.create({
      data: {
        senderId,
        receiverId: recipientId,
        subject: 'Private Chat',
        content: message,
      },
    });
  }

  /**
   * Check if player is muted
   */
  private async checkMuted(playerId: string): Promise<boolean> {
    const muted = await redisClient.get(`player:${playerId}:muted`);
    return muted === '1';
  }

  /**
   * Mute player (admin function)
   */
  async mutePlayer(playerId: string, durationMinutes: number): Promise<void> {
    await redisClient.set(
      `player:${playerId}:muted`,
      '1',
      'EX',
      durationMinutes * 60
    );
  }

  /**
   * Log message for moderation
   */
  private async logMessage(message: ChatMessage): Promise<void> {
    // Store in database for moderation review if needed
    // You could implement keyword filtering, spam detection, etc.
    
    // Simple profanity filter example
    const profanityWords = ['badword1', 'badword2']; // Add actual words
    const hasProfanity = profanityWords.some(word => 
      message.message.toLowerCase().includes(word)
    );
    
    if (hasProfanity) {
      // Flag for review
      await prisma.suspiciousActivity.create({
        data: {
          playerId: message.playerId,
          activityType: 'ProfanityInChat',
          severity: 'Low',
          description: 'Profanity detected in chat',
          evidence: { message: message.message },
        },
      });
    }
  }
}
```

### Real-Time Notifications

```typescript
// server/src/websocket/managers/NotificationManager.ts
import { Server as SocketIOServer } from 'socket.io';
import { getWebSocketServer } from '../socket';

export interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  data?: any;
  timestamp: number;
  read?: boolean;
}

/**
 * Manages real-time notifications to players
 * Used for: trade completions, guild invites, achievements, etc.
 */
export class NotificationManager {
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  /**
   * Send notification to a specific player
   */
  sendToPlayer(playerId: string, notification: Omit<Notification, 'id' | 'timestamp'>): void {
    const fullNotification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      read: false,
      ...notification,
    };

    this.io.to(`player:${playerId}`).emit('notification', fullNotification);
    
    console.log(`[Notification] Sent to ${playerId}: ${notification.title}`);
  }

  /**
   * Send notification to guild members
   */
  sendToGuild(guildId: string, notification: Omit<Notification, 'id' | 'timestamp'>): void {
    const fullNotification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      read: false,
      ...notification,
    };

    this.io.to(`guild:${guildId}`).emit('notification', fullNotification);
  }

  /**
   * Send notification to all players (global event)
   */
  sendToAll(notification: Omit<Notification, 'id' | 'timestamp'>): void {
    const fullNotification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      read: false,
      ...notification,
    };

    this.io.emit('notification', fullNotification);
  }

  /**
   * Common notification helpers
   */

  notifyTradeComplete(playerId: string, profit: number, operationType: string): void {
    this.sendToPlayer(playerId, {
      type: 'success',
      title: 'Trade Complete!',
      message: `Your ${operationType} earned ${profit} gold`,
      data: { profit, operationType },
    });
  }

  notifyGuildInvite(playerId: string, guildName: string, inviterId: string): void {
    this.sendToPlayer(playerId, {
      type: 'info',
      title: 'Guild Invitation',
      message: `You've been invited to join ${guildName}`,
      data: { guildName, inviterId },
    });
  }

  notifyAchievement(playerId: string, achievementName: string): void {
    this.sendToPlayer(playerId, {
      type: 'success',
      title: 'Achievement Unlocked!',
      message: achievementName,
      data: { achievementName },
    });
  }

  notifyMarketSale(playerId: string, itemName: string, amount: number): void {
    this.sendToPlayer(playerId, {
      type: 'success',
      title: 'Item Sold!',
      message: `Your ${itemName} sold for ${amount} gold`,
      data: { itemName, amount },
    });
  }

  notifyJailed(playerId: string, durationMinutes: number): void {
    this.sendToPlayer(playerId, {
      type: 'warning',
      title: 'Caught!',
      message: `You've been sent to jail for ${durationMinutes} minutes`,
      data: { durationMinutes },
    });
  }
}

/**
 * Helper to get notification manager from anywhere in the app
 */
export function sendNotification(
  playerId: string, 
  notification: Omit<Notification, 'id' | 'timestamp'>
): void {
  try {
    const wsServer = getWebSocketServer();
    const manager = new NotificationManager(wsServer['io']);
    manager.sendToPlayer(playerId, notification);
  } catch (error) {
    console.error('[Notification] Failed to send:', error);
  }
}
```

---

## Database Changes

### Additional Prisma Schema

Add these models to your existing schema:

```prisma
// prisma/schema.prisma

// ========================================
// REAL-TIME ADDITIONS
// ========================================

// Online presence tracking
model PlayerPresence {
  id          String   @id @default(uuid())
  playerId    String   @unique
  
  online      Boolean  @default(false)
  location    String?  // tavern, market, guild_hall, etc.
  lastSeen    DateTime @default(now())
  
  player      Player   @relation(fields: [playerId], references: [id], onDelete: Cascade)
  
  updatedAt   DateTime @updatedAt
  
  @@index([online])
  @@index([location])
  @@map("player_presence")
}

// Chat message history (for moderation/reports)
model ChatLog {
  id          String   @id @default(uuid())
  playerId    String
  
  channel     String   // global, trade, guild, location, private
  location    String?  // if location-based
  message     String
  
  flagged     Boolean  @default(false)
  flagReason  String?
  
  player      Player   @relation(fields: [playerId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  
  @@index([playerId])
  @@index([flagged])
  @@index([createdAt])
  @@map("chat_logs")
}

// Mute/ban records
model PlayerMute {
  id          String   @id @default(uuid())
  playerId    String
  
  reason      String
  mutedBy     String   // admin player ID
  
  mutedAt     DateTime @default(now())
  expiresAt   DateTime
  
  active      Boolean  @default(true)
  
  player      Player   @relation(fields: [playerId], references: [id], onDelete: Cascade)
  
  @@index([playerId, active])
  @@map("player_mutes")
}

// Real-time events (coordinated heists, guild wars, etc.)
model LiveEvent {
  id              String   @id @default(uuid())
  
  eventType       String   // heist, guild_war, auction, etc.
  title           String
  description     String
  
  startAt         DateTime
  endAt           DateTime
  
  maxParticipants Int?
  participants    Json     @default("[]") // Array of player IDs
  
  rewards         Json?
  status          String   @default("pending") // pending, active, completed
  
  createdBy       String
  
  createdAt       DateTime @default(now())
  
  @@index([status])
  @@index([startAt])
  @@map("live_events")
}

// Add relations to existing Player model
model Player {
  // ... existing fields ...
  
  // NEW: Real-time relations
  presence        PlayerPresence?
  chatLogs        ChatLog[]
  mutes           PlayerMute[]
  
  // ... rest of existing relations ...
}
```

**Run migration:**
```bash
npx prisma migrate dev --name add_realtime_features
```

---

## Frontend Implementation

### React WebSocket Hook

```typescript
// client/src/hooks/useWebSocket.ts
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppSelector } from '@/store/hooks';

interface UseWebSocketReturn {
  socket: Socket | null;
  connected: boolean;
  joinLocation: (location: string) => void;
  leaveLocation: (location: string) => void;
  sendChatMessage: (channel: string, message: string, location?: string) => void;
}

/**
 * Custom hook for WebSocket connection
 * Handles authentication, reconnection, and basic events
 */
export function useWebSocket(): UseWebSocketReturn {
  const accessToken = useAppSelector(state => state.auth.accessToken);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!accessToken) {
      // No token, don't connect
      return;
    }

    // Initialize socket connection
    const socket = io(import.meta.env.VITE_WS_URL || 'ws://localhost:5000', {
      auth: {
        token: accessToken,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('[WS] Connected:', socket.id);
      setConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('[WS] Disconnected:', reason);
      setConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('[WS] Connection error:', error.message);
    });

    socket.on('error', (error) => {
      console.error('[WS] Error:', error);
    });

    // Cleanup on unmount
    return () => {
      console.log('[WS] Disconnecting...');
      socket.disconnect();
    };
  }, [accessToken]);

  const joinLocation = (location: string) => {
    socketRef.current?.emit('location:join', { location });
  };

  const leaveLocation = (location: string) => {
    socketRef.current?.emit('location:leave', { location });
  };

  const sendChatMessage = (channel: string, message: string, location?: string) => {
    socketRef.current?.emit('chat:send', { channel, message, location });
  };

  return {
    socket: socketRef.current,
    connected,
    joinLocation,
    leaveLocation,
    sendChatMessage,
  };
}
```

### Tavern Component (Real-Time)

```typescript
// client/src/components/game/Tavern/Tavern.tsx
import React, { useEffect, useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { PlayerCard } from './PlayerCard';
import { ChatBox } from '@/components/common/ChatBox';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface PlayerInTavern {
  playerId: string;
  username: string;
  level: number;
  rank: string;
  guildTag?: string;
  joinedAt: number;
}

interface ChatMessage {
  id: string;
  username: string;
  guildTag?: string;
  message: string;
  timestamp: number;
}

/**
 * Tavern - Real-time social hub
 * Players can see each other, chat, and initiate trades
 */
export function Tavern() {
  const { socket, connected, joinLocation, leaveLocation, sendChatMessage } = useWebSocket();
  const [players, setPlayers] = useState<PlayerInTavern[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!socket || !connected) return;

    // Join tavern location
    joinLocation('tavern');
    
    console.log('[Tavern] Joined tavern');

    // Listen for initial player list
    socket.on('location:players', (data: { location: string; players: PlayerInTavern[] }) => {
      if (data.location === 'tavern') {
        setPlayers(data.players);
        setLoading(false);
        console.log(`[Tavern] ${data.players.length} players present`);
      }
    });

    // Listen for new players joining
    socket.on('location:player_joined', (data: { location: string; player: PlayerInTavern }) => {
      if (data.location === 'tavern') {
        setPlayers(prev => {
          // Avoid duplicates
          if (prev.some(p => p.playerId === data.player.playerId)) {
            return prev;
          }
          return [...prev, data.player];
        });
        console.log(`[Tavern] ${data.player.username} joined`);
      }
    });

    // Listen for players leaving
    socket.on('location:player_left', (data: { location: string; playerId: string }) => {
      if (data.location === 'tavern') {
        setPlayers(prev => prev.filter(p => p.playerId !== data.playerId));
        console.log(`[Tavern] Player left`);
      }
    });

    // Listen for chat messages
    socket.on('chat:message', (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message].slice(-100)); // Keep last 100
    });

    // Cleanup on unmount
    return () => {
      leaveLocation('tavern');
      socket.off('location:players');
      socket.off('location:player_joined');
      socket.off('location:player_left');
      socket.off('chat:message');
    };
  }, [socket, connected]);

  const handleSendMessage = (message: string) => {
    sendChatMessage('location', message, 'tavern');
  };

  if (!connected) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-400">Connecting to tavern...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">🍺 The Tavern</h1>
            <p className="text-gray-400 mt-1">
              A gathering place for merchants to socialize and strike deals
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">
              {players.length} {players.length === 1 ? 'merchant' : 'merchants'} present
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Players Present */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Merchants Present</h2>
              
              {players.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  The tavern is empty... for now
                </p>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {players.map(player => (
                    <PlayerCard
                      key={player.playerId}
                      player={player}
                      onChallenge={() => console.log('Challenge:', player.playerId)}
                      onTrade={() => console.log('Trade:', player.playerId)}
                      onMessage={() => console.log('Message:', player.playerId)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat & Activities */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Tavern Chat</h2>
              
              <ChatBox
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                placeholder="Say something to the tavern..."
                maxHeight="500px"
              />
            </div>

            {/* Activities Board */}
            <div className="mt-6 bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">📋 Activities Board</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Looking for heist partners */}
                <div className="bg-gray-700 rounded p-4">
                  <h3 className="font-semibold mb-2">🗡️ Looking for Group</h3>
                  <p className="text-sm text-gray-400">Heist opportunities</p>
                  {/* Dynamic content */}
                </div>

                {/* Trade offers */}
                <div className="bg-gray-700 rounded p-4">
                  <h3 className="font-semibold mb-2">💰 Trade Offers</h3>
                  <p className="text-sm text-gray-400">Quick deals</p>
                  {/* Dynamic content */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Player Card Component

```typescript
// client/src/components/game/Tavern/PlayerCard.tsx
import React from 'react';

interface PlayerCardProps {
  player: {
    playerId: string;
    username: string;
    level: number;
    rank: string;
    guildTag?: string;
    joinedAt: number;
  };
  onChallenge?: () => void;
  onTrade?: () => void;
  onMessage?: () => void;
}

export function PlayerCard({ player, onChallenge, onTrade, onMessage }: PlayerCardProps) {
  return (
    <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
      {/* Player info */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">
              {player.username}
            </span>
            {player.guildTag && (
              <span className="text-xs bg-purple-600 px-2 py-1 rounded">
                [{player.guildTag}]
              </span>
            )}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Level {player.level} {player.rank}
          </div>
        </div>
        
        {/* Online indicator */}
        <div className="w-3 h-3 bg-green-500 rounded-full" title="Online" />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onMessage}
          className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
        >
          💬 Message
        </button>
        <button
          onClick={onTrade}
          className="flex-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
        >
          🤝 Trade
        </button>
        {onChallenge && (
          <button
            onClick={onChallenge}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
            title="Challenge"
          >
            ⚔️
          </button>
        )}
      </div>
    </div>
  );
}
```

### Chat Box Component

```typescript
// client/src/components/common/ChatBox/ChatBox.tsx
import React, { useEffect, useRef, useState } from 'react';

interface ChatMessage {
  id: string;
  username: string;
  guildTag?: string;
  message: string;
  timestamp: number;
}

interface ChatBoxProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  placeholder?: string;
  maxHeight?: string;
}

export function ChatBox({ 
  messages, 
  onSendMessage, 
  placeholder = 'Type a message...',
  maxHeight = '400px'
}: ChatBoxProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    onSendMessage(input.trim());
    setInput('');
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto bg-gray-900 rounded-lg p-4 space-y-2 mb-4"
        style={{ maxHeight }}
      >
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className="flex gap-2">
              <span className="text-gray-500 text-xs flex-shrink-0 mt-1">
                {formatTime(msg.timestamp)}
              </span>
              <div className="flex-1">
                <span className="font-semibold text-blue-400">
                  {msg.username}
                  {msg.guildTag && (
                    <span className="text-purple-400 ml-1">
                      [{msg.guildTag}]
                    </span>
                  )}
                </span>
                <span className="text-gray-300 ml-2">
                  {msg.message}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          maxLength={500}
          className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
```

---

## Performance & Scaling

### Redis Pub/Sub for Multiple Servers

```typescript
// server/src/config/redis.ts
import { createClient } from 'redis';

export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('✅ Redis connected'));

await redisClient.connect();

export const redisPubClient = redisClient.duplicate();
export const redisSubClient = redisClient.duplicate();

await redisPubClient.connect();
await redisSubClient.connect();
```

### Load Balancing Configuration

```nginx
# nginx.conf for load balancing WebSocket connections

upstream websocket_servers {
    ip_hash;  # Sticky sessions (same client to same server)
    server 127.0.0.1:5000;
    server 127.0.0.1:5001;
    server 127.0.0.1:5002;
}

server {
    listen 80;
    server_name api.rogueguild.com;

    location / {
        proxy_pass http://websocket_servers;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }
}
```

### Monitoring WebSocket Connections

```typescript
// server/src/websocket/monitoring.ts
import { getWebSocketServer } from './socket';

/**
 * Get WebSocket server statistics
 */
export function getWebSocketStats() {
  const wsServer = getWebSocketServer();
  const io = wsServer['io'];

  return {
    connectedSockets: io.sockets.sockets.size,
    rooms: io.sockets.adapter.rooms.size,
    timestamp: Date.now(),
  };
}

/**
 * Monitor and log stats periodically
 */
export function startWebSocketMonitoring() {
  setInterval(() => {
    const stats = getWebSocketStats();
    console.log('[WS Stats]', stats);
    
    // Store in Redis for metrics
    redisClient.set('ws:stats', JSON.stringify(stats), 'EX', 60);
  }, 30000); // Every 30 seconds
}
```

---

## Security Considerations

### Rate Limiting WebSocket Events

```typescript
// server/src/websocket/middleware/rateLimitSocket.ts
import { Socket } from 'socket.io';
import { redisClient } from '../../config/redis';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

/**
 * Rate limit WebSocket events per player
 */
export function createSocketRateLimiter(config: RateLimitConfig) {
  return async (socket: Socket, event: string): Promise<boolean> => {
    const playerId = socket.data.playerId;
    const key = `ratelimit:ws:${playerId}:${event}`;
    
    const current = await redisClient.incr(key);
    
    if (current === 1) {
      // First request in window, set expiry
      await redisClient.pExpire(key, config.windowMs);
    }
    
    if (current > config.maxRequests) {
      console.warn(`[RateLimit] Player ${playerId} exceeded limit for ${event}`);
      return false;
    }
    
    return true;
  };
}

// Usage in socket handlers
const chatRateLimiter = createSocketRateLimiter({
  windowMs: 1000,
  maxRequests: 1, // 1 message per second
});

socket.on('chat:send', async (data) => {
  const allowed = await chatRateLimiter(socket, 'chat:send');
  if (!allowed) {
    socket.emit('error', { message: 'Sending messages too fast' });
    return;
  }
  
  // Process message
});
```

### Input Sanitization

```typescript
// server/src/utils/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // No HTML tags allowed in chat
    ALLOWED_ATTR: [],
  });
}

/**
 * Validate and sanitize chat message
 */
export function sanitizeChatMessage(message: string): string {
  // Remove HTML
  let clean = sanitizeHTML(message);
  
  // Trim whitespace
  clean = clean.trim();
  
  // Limit length
  if (clean.length > 500) {
    clean = clean.substring(0, 500);
  }
  
  // Remove excessive spaces
  clean = clean.replace(/\s+/g, ' ');
  
  return clean;
}
```

---

## Migration from Traditional

### Phase 1: Add WebSocket Infrastructure (Week 1-2)
1. Install dependencies
2. Setup WebSocket server
3. Add authentication middleware
4. Test basic connection

### Phase 2: Implement Location System (Week 3-4)
1. Create LocationManager
2. Add Prisma schema changes
3. Implement join/leave logic
4. Test with single location (Tavern)

### Phase 3: Implement Chat System (Week 5-6)
1. Create ChatManager
2. Add chat UI components
3. Implement rate limiting
4. Add moderation tools

### Phase 4: Add Notifications (Week 7)
1. Create NotificationManager
2. Integrate with existing services
3. Add frontend notification display
4. Test all notification types

### Phase 5: Testing & Optimization (Week 8)
1. Load testing with multiple clients
2. Monitor performance
3. Optimize Redis usage
4. Fix bugs

---

## Comparison Summary

### When to Use Traditional (Initial Doc):
✅ Simpler architecture  
✅ Lower hosting costs  
✅ Faster initial development  
✅ Better mobile battery life  
✅ Easier to maintain  
✅ Good for small teams  

### When to Use Hybrid Real-Time (This Doc):
✅ Want MMO feel  
✅ Social interaction is priority  
✅ Real-time events important  
✅ Willing to invest more time  
✅ Have server infrastructure  
✅ Larger development team  

---

## Final Recommendation

Start with **Traditional approach**, add real-time features **gradually**:

**Month 1-3**: Traditional (MVP)
- Get core game working
- Basic multiplayer (async)
- Validate game concept

**Month 4-6**: Add Real-Time
- WebSocket infrastructure
- Live chat
- Real-time notifications

**Month 7+**: Enhance Real-Time
- Location system
- Live events
- Advanced guild features

This allows you to launch faster, validate the concept, and then enhance the social experience based on player feedback.

---

**📝 Note**: This document provides a complete alternative architecture. Review both approaches carefully before committing to implementation. You can also implement a hybrid approach where you start traditional and add real-time features incrementally as the game grows.
