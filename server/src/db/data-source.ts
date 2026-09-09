import 'reflect-metadata';
import 'dotenv/config';
import { Pool } from 'pg';
import { DataSource } from 'typeorm';
import { Event } from '../entities/event.ts';
import { Host } from '../entities/host.ts';
import { Venue } from '../entities/venue.ts';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Event, Host, Venue],
  synchronize: false,
  logging: false,
  driver: { Pool },
});
