import React, { useState } from 'react'
import {
  AccessibilityInfo,
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native'
import {
  DogBreedFeatureError,
  type DetectionEndpointConfig,
  type DogImageAsset,
  type FetchLike,
  type FormDataFactory,
  type ResolvedBreedDetection,
  identifyDogBreed
} from '../../src'

type DogBreedDetectionScreenProps = {
  endpoint: DetectionEndpointConfig
  fetchImpl: FetchLike
  formDataFactory: FormDataFactory
  pickImage: () => Promise<DogImageAsset | null>
}

export function DogBreedDetectionScreen(props: DogBreedDetectionScreenProps) {
  const [asset, setAsset] = useState<DogImageAsset | null>(null)
  const [result, setResult] = useState<ResolvedBreedDetection | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePickImage = async () => {
    const nextAsset = await props.pickImage()
    if (!nextAsset) {
      return
    }

    setAsset(nextAsset)
    setResult(null)
    setErrorMessage(null)
    AccessibilityInfo.announceForAccessibility('Photo selected. Ready to identify breed.')
  }

  const handleIdentifyBreed = async () => {
    if (!asset || isSubmitting) {
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage(null)
      const nextResult = await identifyDogBreed({
        asset,
        endpoint: props.endpoint,
        fetchImpl: props.fetchImpl,
        formDataFactory: props.formDataFactory
      })

      setResult(nextResult)
      AccessibilityInfo.announceForAccessibility(
        `Breed identified: ${nextResult.displayName}. Confidence ${Math.round(nextResult.confidence * 100)} percent.`
      )
    } catch (error) {
      const message =
        error instanceof DogBreedFeatureError
          ? error.message
          : 'The photo could not be processed right now. Please try again.'

      setErrorMessage(message)
      AccessibilityInfo.announceForAccessibility(message)
      Alert.alert('Breed detection failed', message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>
        Find A Dog Breed
      </Text>
      <Text style={styles.subtitle}>
        Upload a photo of a dog and we will verify the predicted breed against the Dog CEO catalog.
      </Text>

      <Pressable
        accessibilityHint="Opens the image picker so you can choose a dog photo from your device"
        accessibilityRole="button"
        onPress={handlePickImage}
        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
      >
        <Text style={styles.primaryButtonLabel}>Choose Photo</Text>
      </Pressable>

      {asset ? (
        <View style={styles.previewCard}>
          <Image
            accessibilityIgnoresInvertColors
            accessibilityLabel="Preview of the selected dog photo"
            source={{ uri: asset.uri }}
            style={styles.previewImage}
          />
          <Text style={styles.previewMeta}>Type: {asset.mimeType}</Text>
          <Text style={styles.previewMeta}>Size: {Math.round(asset.fileSize / 1024)} KB</Text>
          <Text style={styles.previewMeta}>
            Dimensions: {asset.width} by {asset.height}
          </Text>
        </View>
      ) : (
        <View accessible accessibilityRole="summary" style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No photo selected yet.</Text>
        </View>
      )}

      <Pressable
        accessibilityHint="Uploads the selected image securely to the breed detection service"
        accessibilityRole="button"
        accessibilityState={{ busy: isSubmitting, disabled: !asset || isSubmitting }}
        disabled={!asset || isSubmitting}
        onPress={handleIdentifyBreed}
        style={({ pressed }) => [
          styles.secondaryButton,
          (!asset || isSubmitting) && styles.disabledButton,
          pressed && asset && !isSubmitting && styles.pressed
        ]}
      >
        <Text style={styles.secondaryButtonLabel}>{isSubmitting ? 'Identifying...' : 'Identify Breed'}</Text>
      </Pressable>

      {isSubmitting ? (
        <View accessible accessibilityRole="progressbar" style={styles.loadingRow}>
          <ActivityIndicator size="small" />
          <Text style={styles.loadingText}>Uploading photo and analyzing breed.</Text>
        </View>
      ) : null}

      {errorMessage ? (
        <View accessibilityRole="alert" style={styles.errorCard}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {result ? (
        <View accessible accessibilityRole="summary" style={styles.resultCard}>
          <Text style={styles.resultLabel}>Detected Breed</Text>
          <Text style={styles.resultValue}>{result.displayName}</Text>
          <Text style={styles.resultMeta}>Confidence: {Math.round(result.confidence * 100)}%</Text>
          <Text style={styles.resultMeta}>Request ID: {result.requestId}</Text>
        </View>
      ) : null}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 16,
    backgroundColor: '#f7f4ec'
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#1f2937'
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: '#4b5563'
  },
  primaryButton: {
    backgroundColor: '#14532d',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: 'center'
  },
  primaryButtonLabel: {
    color: '#f9fafb',
    fontSize: 16,
    fontWeight: '700'
  },
  secondaryButton: {
    backgroundColor: '#1d4ed8',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: 'center'
  },
  secondaryButtonLabel: {
    color: '#f9fafb',
    fontSize: 16,
    fontWeight: '700'
  },
  disabledButton: {
    opacity: 0.45
  },
  pressed: {
    opacity: 0.8
  },
  previewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    gap: 8
  },
  previewImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: '#d1d5db'
  },
  previewMeta: {
    color: '#374151',
    fontSize: 14
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center'
  },
  emptyStateText: {
    color: '#6b7280',
    fontSize: 15
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  loadingText: {
    color: '#374151',
    fontSize: 14
  },
  errorCard: {
    backgroundColor: '#fee2e2',
    borderRadius: 18,
    padding: 16,
    gap: 6
  },
  errorTitle: {
    color: '#991b1b',
    fontWeight: '700',
    fontSize: 16
  },
  errorText: {
    color: '#7f1d1d',
    fontSize: 14,
    lineHeight: 20
  },
  resultCard: {
    backgroundColor: '#ecfccb',
    borderRadius: 18,
    padding: 18,
    gap: 6
  },
  resultLabel: {
    color: '#3f6212',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  resultValue: {
    color: '#1f2937',
    fontSize: 24,
    fontWeight: '700'
  },
  resultMeta: {
    color: '#3f3f46',
    fontSize: 14
  }
})
