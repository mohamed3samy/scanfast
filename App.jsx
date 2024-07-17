import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {scanBarcodes, BarcodeFormat} from 'vision-camera-code-scanner';
import Animated, {
  useAnimatedProps,
  useSharedValue,
} from 'react-native-reanimated';

const AnimatedText = Animated.createAnimatedComponent(TextInput);

export default function App() {
  const [cameraPermission, setCameraPermission] = useState(null);

  const detectorResult = useSharedValue('');

  useEffect(() => {
    (async () => {
      try {
        const permissionStatus = await Camera.requestCameraPermission();
        setCameraPermission(permissionStatus);
      } catch (error) {
        console.error('Failed to request camera permission:', error);
      }
    })();
  }, []);

  const devices = useCameraDevices();
  const cameraDevice = devices.back;

  const frameProcessor = useFrameProcessor(frame => {
    'worklet';
    const detectedBarcodes = scanBarcodes(frame, [BarcodeFormat.QR_CODE]);
    const barcodesStr = detectedBarcodes
      .map(barcode => barcode.displayValue)
      .join('');

    detectorResult.value = barcodesStr;
  }, []);

  const animatedTextProps = useAnimatedProps(
    () => ({text: detectorResult.value}),
    [detectorResult.value],
  );

  const renderCodeScanner = () => (
    <View>
      <Camera
        style={styles.camera}
        device={cameraDevice}
        isActive={true}
        frameProcessor={frameProcessor}
        frameProcessorFps={5}
      />
      <AnimatedText
        style={styles.barcodeText}
        animatedProps={animatedTextProps}
        editable={false}
        multiline={true}
      />
    </View>
  );

  const renderContent = () => {
    if (!cameraDevice)
      return <ActivityIndicator size="large" color="#1C6758" />;

    if (cameraPermission !== 'authorized')
      return <Text>Camera permission not granted</Text>;

    return renderCodeScanner();
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Scan Fast ⚡</Text>
        </View>
      </SafeAreaView>
      <View style={styles.caption}>
        <Text style={styles.captionText}>QR Code Scanner 🔍</Text>
      </View>

      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#EEF2E6',
  },
  safeArea: {
    backgroundColor: '#3D8361',
  },
  header: {
    height: 50,
    backgroundColor: '#3D8361',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: '#ffffff',
    fontSize: 20,
  },
  caption: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captionText: {
    color: '#100F0F',
    fontSize: 16,
    fontWeight: '600',
  },
  camera: {
    height: 460,
    width: '92%',
    alignSelf: 'center',
  },
  barcodeText: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    textAlign: 'center',
    color: '#100F0F',
    fontSize: 24,
  },
});
