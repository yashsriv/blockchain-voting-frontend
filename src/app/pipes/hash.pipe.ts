import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'hash', pure: true })
export class HashPipe implements PipeTransform {
  async transform(value: string): Promise<string> {
    const digestBuffer = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(value)
    );
    const digestArray = Array.from(new Uint8Array(digestBuffer)); // ciphertext as byte array
    const digestStr = digestArray
      .map(byte => `000${byte.toString(16)}`.slice(-2))
      .join(''); // ciphertext as hex

    return digestStr;
  }
}
