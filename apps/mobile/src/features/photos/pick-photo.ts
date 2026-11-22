import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

import { pickWebPhotoFile, webPhotoObjectUrl } from './web-photo-picker';

export type PickedPhoto = {
  uri: string;
  width: number;
  height: number;
  bytes: number;
};

export type PickPhotoResult = PickedPhoto | 'cancelled' | 'denied';

export async function pickFromLibrary(): Promise<PickPhotoResult> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return 'denied';
  }
  return readPickerAsset(
    await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
      exif: false,
    }),
  );
}

export async function takePhoto(): Promise<PickPhotoResult> {
  if (Platform.OS === 'web') {
    const file = await pickWebPhotoFile();
    if (!file) {
      return 'cancelled';
    }
    const uri = webPhotoObjectUrl(file);
    if (!uri) {
      return 'cancelled';
    }
    return { uri, width: 1, height: 1, bytes: file.size };
  }
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    return 'denied';
  }
  return readPickerAsset(
    await ImagePicker.launchCameraAsync({
      quality: 1,
      exif: false,
    }),
  );
}

function readPickerAsset(result: ImagePicker.ImagePickerResult): PickPhotoResult {
  if (result.canceled) {
    return 'cancelled';
  }
  const asset = result.assets[0];
  if (!asset) {
    return 'cancelled';
  }
  return {
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    bytes: asset.fileSize ?? 1,
  };
}
