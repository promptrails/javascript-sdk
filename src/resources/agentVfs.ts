import {
  AgentVFSFile,
  AgentVFSGrepMatch,
  AgentVFSReadResult,
  AgentVFSWriteMode,
} from "../types";

import { BaseResource } from "./base";

/**
 * Per-agent Virtual Filesystem: list, read, write, mkdir, move, copy,
 * delete, grep, glob. Files persist across executions and double as
 * long-term memory for the agent.
 */
export class AgentVFSResource extends BaseResource {
  async list(
    agentId: string,
    opts: {
      path?: string;
      recursive?: boolean;
      offset?: number;
      limit?: number;
    } = {},
  ): Promise<AgentVFSFile[]> {
    const params: Record<string, string | number> = {};
    if (opts.path) params.path = opts.path;
    if (opts.recursive) params.recursive = "true";
    if (opts.offset != null) params.offset = opts.offset;
    if (opts.limit != null) params.limit = opts.limit;
    const body = await this.http.get(`/api/v1/agents/${agentId}/vfs`, params);
    const data = this.unwrap(body) as { items?: AgentVFSFile[] };
    return data.items ?? [];
  }

  async read(
    agentId: string,
    path: string,
    opts: { lineOffset?: number; lineLimit?: number } = {},
  ): Promise<AgentVFSReadResult> {
    const params: Record<string, string | number> = { path };
    if (opts.lineOffset != null) params.line_offset = opts.lineOffset;
    if (opts.lineLimit != null) params.line_limit = opts.lineLimit;
    const body = await this.http.get(
      `/api/v1/agents/${agentId}/vfs/file`,
      params,
    );
    return this.unwrap(body) as AgentVFSReadResult;
  }

  async write(
    agentId: string,
    path: string,
    content: string,
    opts: { mode?: AgentVFSWriteMode; mimeType?: string } = {},
  ): Promise<AgentVFSFile> {
    const payload: Record<string, unknown> = {
      path,
      content,
      mode: opts.mode ?? "overwrite",
    };
    if (opts.mimeType) payload.mime_type = opts.mimeType;
    const body = await this.http.put(
      `/api/v1/agents/${agentId}/vfs/file`,
      payload,
    );
    return this.unwrap(body) as AgentVFSFile;
  }

  async stat(agentId: string, path: string): Promise<AgentVFSFile> {
    const body = await this.http.get(`/api/v1/agents/${agentId}/vfs/stat`, {
      path,
    });
    return this.unwrap(body) as AgentVFSFile;
  }

  async mkdir(agentId: string, path: string): Promise<AgentVFSFile> {
    const body = await this.http.post(`/api/v1/agents/${agentId}/vfs/mkdir`, {
      path,
    });
    return this.unwrap(body) as AgentVFSFile;
  }

  async move(agentId: string, from: string, to: string): Promise<void> {
    await this.http.post(`/api/v1/agents/${agentId}/vfs/move`, { from, to });
  }

  async copy(agentId: string, from: string, to: string): Promise<void> {
    await this.http.post(`/api/v1/agents/${agentId}/vfs/copy`, { from, to });
  }

  async delete(
    agentId: string,
    path: string,
    opts: { recursive?: boolean } = {},
  ): Promise<number> {
    const qs = new URLSearchParams({ path });
    if (opts.recursive) qs.set("recursive", "true");
    const body = await this.http.delete(
      `/api/v1/agents/${agentId}/vfs?${qs.toString()}`,
    );
    const data = (this.unwrap(body) as { deleted?: number }) ?? {};
    return data.deleted ?? 0;
  }

  async grep(
    agentId: string,
    query: string,
    opts: { path?: string; limit?: number } = {},
  ): Promise<AgentVFSGrepMatch[]> {
    const params: Record<string, string | number> = { q: query };
    if (opts.path) params.path = opts.path;
    if (opts.limit != null) params.limit = opts.limit;
    const body = await this.http.get(
      `/api/v1/agents/${agentId}/vfs/grep`,
      params,
    );
    const data = this.unwrap(body) as { matches?: AgentVFSGrepMatch[] };
    return data.matches ?? [];
  }

  async glob(
    agentId: string,
    pattern: string,
    opts: { path?: string; limit?: number } = {},
  ): Promise<AgentVFSFile[]> {
    const params: Record<string, string | number> = { pattern };
    if (opts.path) params.path = opts.path;
    if (opts.limit != null) params.limit = opts.limit;
    const body = await this.http.get(
      `/api/v1/agents/${agentId}/vfs/glob`,
      params,
    );
    const data = this.unwrap(body) as { items?: AgentVFSFile[] };
    return data.items ?? [];
  }

  async usage(agentId: string): Promise<number> {
    const body = await this.http.get(`/api/v1/agents/${agentId}/vfs/usage`);
    const data = this.unwrap(body) as { bytes_used?: number };
    return data.bytes_used ?? 0;
  }
}
