import AsyncStorage from '@react-native-async-storage/async-storage';

import i18n from '@/lib/i18n';
import { hydrateLocale, setAppLocale } from '@/lib/locale-preference';

describe('locale preference', () => {
  afterEach(async () => {
    await AsyncStorage.clear();
    await i18n.changeLanguage('fr');
  });

  it('saves the switch and restores it over the device language', async () => {
    await setAppLocale('en');
    await i18n.changeLanguage('fr');

    await expect(hydrateLocale()).resolves.toBe('en');
    expect(i18n.language).toBe('en');
  });
});
