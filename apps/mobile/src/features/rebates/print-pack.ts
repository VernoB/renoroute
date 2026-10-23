import * as Print from 'expo-print';

export async function printHtml(html: string): Promise<void> {
  await Print.printAsync({ html });
}
