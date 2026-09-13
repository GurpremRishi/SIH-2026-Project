import QRCode from 'qrcode';

export async function generateQrDataUrl(payload: string): Promise<string> {
  try {
    return await QRCode.toDataURL(payload, {
      width: 320,
      margin: 2,
      color: {
        dark: '#1E293B',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    });
  } catch (err) {
    console.error('Failed to generate QR code:', err);
    return '';
  }
}

export function generateCryptoHash(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `0x${hex}${Date.now().toString(16).slice(-8)}`;
}

export function generateIpfsCid(seed: string): string {
  const hex = Array.from(seed)
    .map((c) => c.charCodeAt(0).toString(16))
    .join('')
    .slice(0, 32);
  return `ipfs://Qm${hex.slice(0, 10)}Xv7w${hex.slice(10, 20)}kL9p${hex.slice(20, 28)}`;
}
