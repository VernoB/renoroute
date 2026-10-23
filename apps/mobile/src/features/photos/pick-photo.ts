import * as ImagePicker from 'expo-image-picker';

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
