import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Share,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Text, Avatar, Button } from '@/components/ui';
import { colors, spacing, borderRadius } from '@/lib/theme';
import { fetchAthleteById, fetchTalentReport, generateTalentReport, Athlete, TalentReport } from '@/data/api';
import { useToast } from '@/hooks/useToast';

export default function TalentReportScreen() {
  const { athleteId } = useLocalSearchParams<{ athleteId: string }>();
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [report, setReport] = useState<TalentReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { showToast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [athleteResult, reportResult] = await Promise.allSettled([
        fetchAthleteById(athleteId!),
        fetchTalentReport(athleteId!)
      ]);

      if (athleteResult.status === 'fulfilled') {
        if (athleteResult.value) {
          setAthlete(athleteResult.value);
        }
      } else {
        console.error('Error loading athlete profile:', athleteResult.reason);
        showToast({ message: 'Failed to load athlete profile', type: 'error' });
      }

      if (reportResult.status === 'fulfilled') {
        if (reportResult.value) {
          setReport(reportResult.value);
        }
      } else {
        console.error('Error loading talent report:', reportResult.reason);
        showToast({ message: 'Failed to load talent report', type: 'error' });
      }
    } catch (error) {
      console.error('Unexpected error loading data:', error);
      showToast({ message: 'Failed to load data', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [athleteId, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const newReport = await generateTalentReport(athleteId!);
      setReport(newReport);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast({ message: 'Report generated successfully!', type: 'success' });
    } catch (error: any) {
      console.error('Generation error:', error);
      
      const status = error.response?.status;
      if (status === 504 || status === 502) {
        showToast({ message: 'AI analysis timed out. Please try again.', type: 'error' });
      } else {
        showToast({ message: 'Failed to generate report. Try again.', type: 'error' });
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!report || !athlete) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: `${athlete.name}'s Talent Report:\n\n${report.reportText}`,
        title: 'Talent Recognition Report',
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading && !athlete) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary[600]} />
          <Text variant="body" color={colors.foregroundMuted} style={styles.loadingText}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!athlete) return null;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Talent Report',
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerTintColor: colors.foreground,
          headerRight: () => (
            report ? (
              <Pressable onPress={handleShare} hitSlop={8}>
                <Ionicons name="share-outline" size={22} color={colors.foreground} />
              </Pressable>
            ) : null
          ),
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Athlete Header */}
          <Animated.View 
            entering={FadeIn.duration(200)}
            style={styles.athleteHeader}
          >
            <Avatar name={athlete.name} source={athlete.avatar} size="lg" />
            <View style={styles.athleteInfo}>
              <Text variant="h4" weight="semibold">{athlete.name}</Text>
              <Text variant="caption" color={colors.foregroundMuted}>
                {report ? `Generated: ${new Date(report.createdAt).toLocaleDateString()}` : 'No report available'}
              </Text>
            </View>
          </Animated.View>

          {/* Report Content */}
          {report ? (
            <Animated.View 
              entering={FadeInDown.delay(50).duration(200)}
              style={styles.reportContainer}
            >
               <View style={styles.reportHeader}>
                  <Text variant="h5" weight="semibold">Analysis Result</Text>
                  <Ionicons name="analytics-outline" size={20} color={colors.primary[600]} />
               </View>
               <View style={styles.reportCard}>
                 <Text variant="body" style={styles.reportText}>
                   {report.reportText}
                 </Text>
               </View>

               <Button
                 title="Regenerate Analysis"
                 variant="outline"
                 style={styles.actionButton}
                 onPress={handleGenerate}
                 loading={generating}
               />
            </Animated.View>
          ) : (
            <Animated.View 
              entering={FadeInDown.delay(50).duration(200)}
              style={styles.emptyState}
            >
              <Ionicons name="sparkles-outline" size={48} color={colors.primary[600]} />
              <Text variant="h5" weight="semibold" style={styles.emptyTitle}>
                Unlock Athletic Potential
              </Text>
              <Text variant="body" color={colors.foregroundSecondary} style={styles.emptyText}>
                Generate an AI-powered analysis of {athlete.name}'s performance, strengths, and growth areas based on recent training data.
              </Text>
              <Button
                title="Generate Analysis"
                variant="primary"
                size="lg"
                onPress={handleGenerate}
                loading={generating}
                fullWidth
              />
            </Animated.View>
          )}

        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[12],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  athleteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  athleteInfo: {
    marginLeft: spacing[3],
  },
  reportContainer: {
    gap: spacing[4],
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  reportCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing[5],
    borderWidth: 1,
    borderColor: colors.border,
  },
  reportText: {
    lineHeight: 24,
    color: colors.foreground,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing[6],
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing[3],
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: spacing[4],
    lineHeight: 22,
  },
  actionButton: {
    marginTop: spacing[4],
  },
  loadingText: {
    marginTop: spacing[4],
  },
});
