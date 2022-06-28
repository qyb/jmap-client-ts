import { Transport } from './transport';

type Fetch = (
  url: string,
  params: {
    method: 'POST' | 'GET';
    body: any;
    headers: { [header: string]: string };
  },
) => Promise<Response>;
/* in VSCode, including Response definition will cause type-checking warning
type Response = {
  status: number;
  headers: Headers;
  json: () => any;
  blob: () => Blob;
};
*/
export class FetchTransport implements Transport {
  private fetch: Fetch;

  constructor(fetch: Fetch) {
    this.fetch = fetch;
  }

  public post<ResponseType>(
    url: string,
    content: any,
    headers: { [headerName: string]: string },
  ): Promise<ResponseType> {
    return this.request<ResponseType>({
      url,
      method: 'POST',
      body: content,
      headers,
    });
  }

  public get<ResponseType>(
    url: string,
    headers: { [headerName: string]: string },
  ): Promise<ResponseType> {
    return this.request<ResponseType>({ url, method: 'GET', headers });
  }

  private request<ResponseType>({
    url,
    method,
    body,
    headers,
  }: {
    url: string;
    method: 'POST' | 'GET';
    body?: any;
    headers: { [headerName: string]: string };
  }): Promise<ResponseType> {
    return this.fetch(url, {
      method,
      body: JSON.stringify(body),
      headers: headers,
    }).then(response => {
      if (response.status !== 200) {
        throw new Error(`Request failed, got http status code ${response.status}`);
      }
      if (response.headers.get('content-type')?.startsWith('application/json')) {
        return response.json();
      } else {
        return response.blob();
      }
    });
  }
}
