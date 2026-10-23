import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native';

import i18n from '@/lib/i18n';

import { PhotoChecklist } from './photo-checklist';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const copy = {
  fr: {
    title: 'Photos de la maison',
    hint: "Pas de visages ni d'adresses visibles.",
    recommended: 'Recommandé',
    optional: 'Facultatif',
    addGallery: 'Ajouter depuis la galerie',
    takePhoto: 'Prendre une photo',
    window: 'Fenêtres',
    exterior: 'Extérieur',
  },
  en: {
    title: 'Home photos',
    hint: 'Avoid faces and visible addresses.',
    recommended: 'Recommended',
    optional: 'Optional',
    addGallery: 'Add from gallery',
    takePhoto: 'Take a photo',
    window: 'Windows',
    exterior: 'Exterior',
  },
} as const;

describe('PhotoChecklist', () => {
  afterEach(async () => {
    cleanup();
    await i18n.changeLanguage('fr');
  });

  it('shows French categories, 0/N counts, and badges', async () => {
    await i18n.changeLanguage('fr');
    await render(<PhotoChecklist counts={{}} onAdd={() => undefined} />);
    const text = copy.fr;
    expect(screen.getByText(text.title)).toBeTruthy();
    expect(screen.getByText(text.hint)).toBeTruthy();
    expect(screen.getByText(text.window)).toBeTruthy();
    expect(screen.getByText(text.exterior)).toBeTruthy();
    expect(screen.getByTestId('photo-count-window').props.children).toBe('0/2');
    expect(screen.getAllByText(text.recommended).length).toBeGreaterThan(0);
    expect(screen.getAllByText(text.optional).length).toBeGreaterThan(0);
    expect(screen.getByText(text.addGallery)).toBeTruthy();
  });

  it('shows English categories and a filled recommended count', async () => {
    await i18n.changeLanguage('en');
    await render(<PhotoChecklist counts={{ window: 1 }} onAdd={() => undefined} />);
    const text = copy.en;
    expect(screen.getByText(text.title)).toBeTruthy();
    expect(screen.getByText(text.window)).toBeTruthy();
    expect(screen.getByTestId('photo-count-window').props.children).toBe('1/2');
    expect(screen.getByText(text.addGallery)).toBeTruthy();
    expect(screen.queryByText(text.takePhoto)).toBeNull();
  });

  it('calls onAdd with the tapped category', async () => {
    const onAdd = jest.fn();
    await i18n.changeLanguage('fr');
    await render(<PhotoChecklist counts={{}} onAdd={onAdd} />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('photo-category-window'));
    });
    expect(onAdd).toHaveBeenCalledWith('window');
  });

  it('does not import supabase-js or expo-camera', () => {
    const source = readFileSync(join(__dirname, 'photo-checklist.tsx'), 'utf8');
    expect(source.includes('@supabase/supabase-js')).toBe(false);
    expect(source.includes('expo-camera')).toBe(false);
  });

  it('calls onTakePhoto when the optional capture button is shown', async () => {
    const onTakePhoto = jest.fn();
    await i18n.changeLanguage('en');
    await render(
      <PhotoChecklist counts={{ window: 2 }} onAdd={() => undefined} onTakePhoto={onTakePhoto} />,
    );
    await act(async () => {
      fireEvent.press(screen.getByLabelText(copy.en.takePhoto));
    });
    expect(onTakePhoto).toHaveBeenCalledWith('door');
  });
});
