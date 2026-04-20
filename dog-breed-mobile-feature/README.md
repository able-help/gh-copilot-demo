# Dog Breed Mobile Feature

A secure, React Native-ready feature slice for uploading a dog image and resolving a breed using:

- Dog CEO for breed catalog data
- a separate backend classification endpoint for image inference
- Jest unit tests for validation and orchestration logic

## Why a backend is required

The Dog CEO API does not classify an uploaded photo into a breed. It provides breed metadata and sample image endpoints. A production-safe solution should:

1. validate the image on-device
2. send the image to your backend over TLS
3. run model inference on the backend
4. normalize and verify the returned breed against Dog CEO breed data

## Install

```bash
cd dog-breed-mobile-feature
npm install
npm test
npm run build
```

## Suggested React Native integration

1. Use `expo-image-picker` or `react-native-image-picker` to capture/select an image.
2. Convert the selected asset into the `DogImageAsset` shape from `src/types.ts`.
3. Call `identifyDogBreed()` from `src/dogBreedFeature.ts`.
4. Render the returned `ResolvedBreedDetection` in your screen.

## Included examples and guides

- React Native example screen: `examples/react-native/DogBreedDetectionScreen.tsx`
- Picker adapters: `examples/react-native/imagePickerAdapters.ts`
- Accessibility guide: `docs/react-native-accessibility.md`
- Secure upload guide: `docs/secure-photo-upload.md`
- OWASP checklist: `docs/owasp-coaching.md`

## Learning references

- OWASP Top 10: https://owasp.org/Top10/
- OWASP Mobile Top 10: https://owasp.org/www-project-mobile-top-10/
- OWASP MASVS: https://mas.owasp.org/MASVS/
- Dog CEO documentation: https://dog.ceo/dog-api/documentation/
- Jest getting started: https://jestjs.io/docs/getting-started
- Expo Image Picker: https://docs.expo.dev/versions/latest/sdk/imagepicker/
- React Native Image Picker: https://github.com/react-native-image-picker/react-native-image-picker
