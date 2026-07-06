import QRCode from "qrcode";

export async function generateAddressQr(address: string): Promise<Buffer> {
  return QRCode.toBuffer(address, {
    type: "png",
    width: 400,
    margin: 2,
    color: { dark: "#1a1a2e", light: "#ffffff" },
  });
}
