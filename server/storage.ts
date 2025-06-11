import {
  users,
  talents,
  settings,
  type User,
  type UpsertUser,
  type Talent,
  type InsertTalent,
  type UpdateTalent,
  type Settings,
  type InsertSettings,
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Talent operations
  getTalents(page: number, limit: number): Promise<{ talents: Talent[]; total: number }>;
  getTalent(id: number): Promise<Talent | undefined>;
  getTalentByTalentId(talentId: string): Promise<Talent | undefined>;
  createTalent(talent: InsertTalent): Promise<Talent>;
  updateTalent(id: number, talent: UpdateTalent): Promise<Talent | undefined>;
  deleteTalent(id: number): Promise<boolean>;
  getPreviousTalent(currentId: number): Promise<Talent | undefined>;
  getNextTalent(currentId: number): Promise<Talent | undefined>;
  
  // Settings operations
  getSettings(): Promise<Settings | undefined>;
  upsertSettings(settings: InsertSettings): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private talents: Map<number, Talent> = new Map();
  private settings: Settings | undefined;
  private currentTalentId = 1;
  private currentSettingsId = 1;

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id);
    const user: User = {
      ...userData,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(userData.id, user);
    return user;
  }

  // Talent operations
  async getTalents(page: number, limit: number): Promise<{ talents: Talent[]; total: number }> {
    const allTalents = Array.from(this.talents.values()).sort((a, b) => a.id - b.id);
    const total = allTalents.length;
    const startIndex = (page - 1) * limit;
    const talents = allTalents.slice(startIndex, startIndex + limit);
    return { talents, total };
  }

  async getTalent(id: number): Promise<Talent | undefined> {
    return this.talents.get(id);
  }

  async getTalentByTalentId(talentId: string): Promise<Talent | undefined> {
    return Array.from(this.talents.values()).find(t => t.talentId === talentId);
  }

  async createTalent(talentData: InsertTalent): Promise<Talent> {
    const talent: Talent = {
      ...talentData,
      id: this.currentTalentId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.talents.set(talent.id, talent);
    return talent;
  }

  async updateTalent(id: number, talentData: UpdateTalent): Promise<Talent | undefined> {
    const existing = this.talents.get(id);
    if (!existing) return undefined;
    
    const updated: Talent = {
      ...existing,
      ...talentData,
      updatedAt: new Date(),
    };
    this.talents.set(id, updated);
    return updated;
  }

  async deleteTalent(id: number): Promise<boolean> {
    return this.talents.delete(id);
  }

  async getPreviousTalent(currentId: number): Promise<Talent | undefined> {
    const allTalents = Array.from(this.talents.values()).sort((a, b) => a.id - b.id);
    const currentIndex = allTalents.findIndex(t => t.id === currentId);
    if (currentIndex <= 0) return undefined;
    return allTalents[currentIndex - 1];
  }

  async getNextTalent(currentId: number): Promise<Talent | undefined> {
    const allTalents = Array.from(this.talents.values()).sort((a, b) => a.id - b.id);
    const currentIndex = allTalents.findIndex(t => t.id === currentId);
    if (currentIndex === -1 || currentIndex >= allTalents.length - 1) return undefined;
    return allTalents[currentIndex + 1];
  }

  // Settings operations
  async getSettings(): Promise<Settings | undefined> {
    return this.settings;
  }

  async upsertSettings(settingsData: InsertSettings): Promise<Settings> {
    const settings: Settings = {
      ...settingsData,
      id: this.settings?.id || this.currentSettingsId++,
      createdAt: this.settings?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.settings = settings;
    return settings;
  }
}

export const storage = new MemStorage();
