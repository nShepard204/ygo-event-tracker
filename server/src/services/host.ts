import { type DeepPartial, type QueryDeepPartialEntity } from 'typeorm';
import { Host } from '../entities/host.ts';
import { hostRepository } from '../repositories/host.ts';

export class HostService {
  static async createHost(data: DeepPartial<Host>): Promise<Host> {
    return await hostRepository.save(hostRepository.create(data));
  }

  static async getHostById(id: number): Promise<Host | null> {
    return await hostRepository.findOneBy({ id });
  }

  static async getHostByName(name: string): Promise<Host | null> {
    return await hostRepository.findOneBy({ name });
  }

  static async getAllHosts(): Promise<Host[]> {
    return await hostRepository.find();
  }

  static async updateHost(
    id: number,
    data: QueryDeepPartialEntity<Host>
  ): Promise<Host | null> {
    await hostRepository.update(id, data);
    return this.getHostById(id);
  }

  static async deleteHost(id: number): Promise<boolean> {
    const result = await hostRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  static async upsertScrapedHost(
    data: DeepPartial<Host>
  ): Promise<Host | null> {
    const existingHost = await this.getHostByName(data.name ?? '');
    if (existingHost !== null) {
      return await this.updateHost(existingHost.id, data);
    } else {
      return await this.createHost(data);
    }
  }
}
