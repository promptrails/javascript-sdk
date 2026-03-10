import { HTTPClient } from "../http";

export class BaseResource {
  protected http: HTTPClient;

  constructor(http: HTTPClient) {
    this.http = http;
  }

  protected unwrap(body: Record<string, unknown>): unknown {
    return body.data !== undefined ? body.data : body;
  }
}
