import { AgentMemory } from "../types";

import { BaseResource } from "./base";

export class MemoriesResource extends BaseResource {
  async get(memoryId: string): Promise<AgentMemory> {
    const body = await this.http.get(`/api/v1/memories/${memoryId}`);
    return this.unwrap(body) as AgentMemory;
  }

  async delete(memoryId: string): Promise<void> {
    await this.http.delete(`/api/v1/memories/${memoryId}`);
  }
}
