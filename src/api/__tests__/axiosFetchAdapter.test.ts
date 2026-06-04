jest.mock('../axiosInstance', () => ({
  axiosInstance: {
    request: jest.fn(),
  },
}));

import { axiosInstance } from '../axiosInstance';
import { axiosFetchAdapter } from '../axiosFetchAdapter';

describe('axiosFetchAdapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses string input as URL directly', async () => {
    (axiosInstance.request as jest.Mock).mockResolvedValue({
      status: 200,
      statusText: 'OK',
      data: new ArrayBuffer(0),
      headers: {},
    });

    await axiosFetchAdapter('https://example.com/api', { method: 'GET' });

    expect(axiosInstance.request).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'https://example.com/api' })
    );
  });

  it('calls toString() on non-string input (URL object)', async () => {
    (axiosInstance.request as jest.Mock).mockResolvedValue({
      status: 200,
      statusText: 'OK',
      data: new ArrayBuffer(0),
      headers: {},
    });

    const urlObj = new URL('https://example.com/api');
    await axiosFetchAdapter(urlObj, { method: 'GET' });

    expect(axiosInstance.request).toHaveBeenCalledWith(
      expect.objectContaining({ url: urlObj.toString() })
    );
  });

  it('returns Response with null body and status 204 when axios returns 204', async () => {
    (axiosInstance.request as jest.Mock).mockResolvedValue({
      status: 204,
      statusText: 'No Content',
      data: new ArrayBuffer(0),
      headers: {},
    });

    const response = await axiosFetchAdapter('https://example.com/resource', {
      method: 'DELETE',
    });

    expect(response.status).toBe(204);
    expect(response.statusText).toBe('No Content');
    const text = await response.text();
    expect(text).toBe('');
  });

  it('returns Response with blob body and correct status for non-204 responses', async () => {
    const buffer = Buffer.from('{"id":1}');
    (axiosInstance.request as jest.Mock).mockResolvedValue({
      status: 200,
      statusText: 'OK',
      data: buffer,
      headers: {},
    });

    const response = await axiosFetchAdapter('https://example.com/api', { method: 'GET' });

    expect(response.status).toBe(200);
    expect(response.statusText).toBe('OK');
    const text = await response.text();
    expect(text).toBe('{"id":1}');
  });

  it('passes method, headers and body from init to axiosInstance.request', async () => {
    (axiosInstance.request as jest.Mock).mockResolvedValue({
      status: 201,
      statusText: 'Created',
      data: new ArrayBuffer(0),
      headers: {},
    });

    await axiosFetchAdapter('https://example.com/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"name":"test"}',
    });

    expect(axiosInstance.request).toHaveBeenCalledWith({
      url: 'https://example.com/api',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: '{"name":"test"}',
      responseType: 'arraybuffer',
    });
  });
});
