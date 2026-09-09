import { type DeepPartial, type QueryDeepPartialEntity } from 'typeorm';
import { Event } from '../entities/event.ts';
import { eventRepository } from '../repositories/event.ts';

export class EventService {
  static async createEvent(data: DeepPartial<Event>): Promise<Event> {
    return await eventRepository.save(eventRepository.create(data));
  }

  static async getEventById(id: number): Promise<Event | null> {
    return await eventRepository.findOne({
      where: { id },
      relations: { venue: true, host: true },
    });
  }

  static async getEventByHeuristic(
    data: DeepPartial<Event>
  ): Promise<Event | null> {
    return await eventRepository.findOne({
      where: {
        venueId: data.venueId,
        hostId: data.hostId,
        date: data.date!,
      },
    });
  }

  static async getAllEvents(): Promise<Event[]> {
    return await eventRepository.find({
      relations: { venue: true, host: true },
    });
  }

  static async updateEvent(
    id: number,
    data: QueryDeepPartialEntity<Event>
  ): Promise<Event | null> {
    await eventRepository.update(id, data);
    return this.getEventById(id);
  }

  static async deleteEvent(id: number): Promise<boolean> {
    const result = await eventRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  static async upsertScrapedEvent(
    data: DeepPartial<Event>
  ): Promise<Event | null> {
    const existingEvent = await this.getEventByHeuristic(data);
    if (existingEvent !== null) {
      return await this.updateEvent(existingEvent.id, data);
    } else {
      return await this.createEvent(data);
    }
  }
}
