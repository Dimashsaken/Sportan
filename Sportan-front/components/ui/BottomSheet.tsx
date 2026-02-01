import React, { memo, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  Dimensions,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, animation } from '@/lib/theme';
import { Text } from './Text';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  snapPoints?: number[];
  initialSnapIndex?: number;
  enablePanDownToClose?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
}

export interface BottomSheetRef {
  expand: () => void;
  collapse: () => void;
  close: () => void;
}

export const BottomSheet = memo(forwardRef<BottomSheetRef, BottomSheetProps>(({
  visible,
  onClose,
  title,
  snapPoints = [0.5],
  initialSnapIndex = 0,
  enablePanDownToClose = true,
  children,
  style,
}, ref) => {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const overlayOpacity = useSharedValue(0);
  const context = useSharedValue({ y: 0 });

  const maxSnapPoint = Math.max(...snapPoints);
  const sheetHeight = SCREEN_HEIGHT * maxSnapPoint;

  const openSheet = useCallback(() => {
    const targetY = SCREEN_HEIGHT * (1 - snapPoints[initialSnapIndex]);
    translateY.value = withSpring(targetY, animation.spring.default);
    overlayOpacity.value = withTiming(1, { duration: animation.duration.normal });
  }, [translateY, overlayOpacity, snapPoints, initialSnapIndex]);

  const closeSheet = useCallback(() => {
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: animation.duration.normal });
    overlayOpacity.value = withTiming(0, { duration: animation.duration.normal }, () => {
      runOnJS(onClose)();
    });
  }, [translateY, overlayOpacity, onClose]);

  useImperativeHandle(ref, () => ({
    expand: () => {
      const targetY = SCREEN_HEIGHT * (1 - maxSnapPoint);
      translateY.value = withSpring(targetY, animation.spring.default);
    },
    collapse: () => {
      const targetY = SCREEN_HEIGHT * (1 - snapPoints[0]);
      translateY.value = withSpring(targetY, animation.spring.default);
    },
    close: closeSheet,
  }), [translateY, snapPoints, maxSnapPoint, closeSheet]);

  useEffect(() => {
    if (visible) {
      openSheet();
    }
  }, [visible, openSheet]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      const newY = context.value.y + event.translationY;
      const minY = SCREEN_HEIGHT * (1 - maxSnapPoint);
      translateY.value = Math.max(minY, newY);
    })
    .onEnd((event) => {
      const currentY = translateY.value;
      const velocity = event.velocityY;

      // If swiping down fast or past threshold, close
      if (enablePanDownToClose && (velocity > 500 || currentY > SCREEN_HEIGHT * 0.7)) {
        runOnJS(closeSheet)();
        return;
      }

      // Find nearest snap point
      let nearestSnapY = SCREEN_HEIGHT * (1 - snapPoints[0]);
      let nearestDistance = Math.abs(currentY - nearestSnapY);

      snapPoints.forEach((point) => {
        const snapY = SCREEN_HEIGHT * (1 - point);
        const distance = Math.abs(currentY - snapY);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestSnapY = snapY;
        }
      });

      translateY.value = withSpring(nearestSnapY, animation.spring.default);
    });

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={closeSheet}
    >
      <View style={styles.modalContainer}>
        <Animated.View style={[styles.overlay, animatedOverlayStyle]}>
          <Pressable style={styles.overlayPressable} onPress={closeSheet} />
        </Animated.View>

        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.sheet,
              {
                height: sheetHeight + insets.bottom,
                paddingBottom: insets.bottom,
              },
              animatedSheetStyle,
              style,
            ]}
          >
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            {title && (
              <View style={styles.header}>
                <Text variant="h5" weight="semibold">
                  {title}
                </Text>
              </View>
            )}

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.content}
            >
              {children}
            </KeyboardAvoidingView>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}));

BottomSheet.displayName = 'BottomSheet';

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  overlayPressable: {
    flex: 1,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.neutral[300],
    borderRadius: 2,
  },
  header: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: {
    flex: 1,
  },
});

export default BottomSheet;






