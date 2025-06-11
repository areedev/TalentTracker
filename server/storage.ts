import {
  users,
  talents,
  settings,
  type User,
  type UpsertUser,
  type InsertUser,
  type Talent,
  type InsertTalent,
  type UpdateTalent,
  type Settings,
  type InsertSettings,
} from "@shared/schema";
import { v4 as uuidv4 } from 'uuid';

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
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

  constructor() {
    // Add sample talent data
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    const sampleTalents = [
      {
        talentId: "talent-001",
        talentUrl: "https://example.com/john-doe",
        fullName: "John Doe",
        nationality: "American",
        location: "New York, NY",
        externalLinks: [
          { name: "LinkedIn", url: "https://linkedin.com/in/johndoe" },
          { name: "GitHub", url: "https://github.com/johndoe" },
        ],
        email: "",
        note: "",
        important: false,
      },
      {
        talentId: "talent-002",
        talentUrl: "https://example.com/jane-smith",
        fullName: "Jane Smith",
        nationality: "Canadian",
        location: "Toronto, ON",
        externalLinks: [
          { name: "LinkedIn", url: "https://linkedin.com/in/janesmith" },
          { name: "Portfolio", url: "https://janesmith.dev" },
        ],
        email: "",
        note: "",
        important: false,
      },
      {
        talentId: "talent-003",
        talentUrl: "https://example.com/alex-chen",
        fullName: "Alex Chen",
        nationality: "Chinese",
        location: "Shanghai, China",
        externalLinks: [
          { name: "LinkedIn", url: "https://linkedin.com/in/alexchen" },
          { name: "Twitter", url: "https://twitter.com/alexchen" },
        ],
        email: "",
        note: "",
        important: false,
      },
      {
        talentId: "talent-004",
        talentUrl: "https://example.com/maria-garcia",
        fullName: "Maria Garcia",
        nationality: "Spanish",
        location: "Madrid, Spain",
        externalLinks: [
          { name: "LinkedIn", url: "https://linkedin.com/in/mariagarcia" },
          { name: "Behance", url: "https://behance.net/mariagarcia" },
        ],
        email: "",
        note: "",
        important: false,
      },
      {
        talentId: "talent-005",
        talentUrl: "https://example.com/david-kim",
        fullName: "David Kim",
        nationality: "South Korean",
        location: "Seoul, South Korea",
        externalLinks: [
          { name: "LinkedIn", url: "https://linkedin.com/in/davidkim" },
          { name: "GitHub", url: "https://github.com/davidkim" },
        ],
        email: "",
        note: "",
        important: false,
      },
    ];

    for (const talentData of sampleTalents) {
      await this.createTalent(talentData);
    }
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const user: User = {
      ...userData,
      id: uuidv4(),
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id);
    const user: User = {
      ...userData,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
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
      email: talentData.email || null,
      talentUrl: talentData.talentUrl || null,
      nationality: talentData.nationality || null,
      location: talentData.location || null,
      externalLinks: talentData.externalLinks ? [...talentData.externalLinks] : null,
      note: talentData.note || null,
      important: talentData.important || null,
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
      email: talentData.email !== undefined ? talentData.email || null : existing.email,
      talentUrl: talentData.talentUrl !== undefined ? talentData.talentUrl || null : existing.talentUrl,
      nationality: talentData.nationality !== undefined ? talentData.nationality || null : existing.nationality,
      location: talentData.location !== undefined ? talentData.location || null : existing.location,
      externalLinks: talentData.externalLinks !== undefined ? (talentData.externalLinks ? [...talentData.externalLinks] : null) : existing.externalLinks,
      note: talentData.note !== undefined ? talentData.note || null : existing.note,
      important: talentData.important !== undefined ? talentData.important || null : existing.important,
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
      smtpHost: settingsData.smtpHost || null,
      smtpPort: settingsData.smtpPort || null,
      smtpUsername: settingsData.smtpUsername || null,
      smtpPassword: settingsData.smtpPassword || null,
      smtpSecure: settingsData.smtpSecure || null,
      emailSubject: settingsData.emailSubject || null,
      emailTemplate: settingsData.emailTemplate || null,
      fromName: settingsData.fromName || null,
      fromEmail: settingsData.fromEmail || null,
      createdAt: this.settings?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.settings = settings;
    return settings;
  }
}

export const storage = new MemStorage();
