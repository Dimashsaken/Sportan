import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import Animated, { FadeIn, FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Text, Button, ProgressBar, Badge, Avatar, Card } from '@/components/ui';
import { colors, spacing, borderRadius } from '@/lib/theme';
import { fetchAthleteById, Athlete } from '@/data/api';

// Movement Skills Data
const MOVEMENT_SKILLS = [
  { id: 1, name: 'Run a square', category: 'Running' },
  { id: 2, name: 'Run there and back', category: 'Running' },
  { id: 3, name: 'Run, jump, land on two feet', category: 'Running' },
  { id: 4, name: 'Crossovers', category: 'Locomotor Control' },
  { id: 5, name: 'Skip', category: 'Locomotor Control' },
  { id: 6, name: 'Gallop', category: 'Locomotor Control' },
  { id: 7, name: 'Hop', category: 'Locomotor Control' },
  { id: 8, name: 'Jump', category: 'Locomotor Control' },
  { id: 9, name: 'Overhead throw', category: 'Object Control - Upper' },
  { id: 10, name: 'Strike with stick', category: 'Object Control - Upper' },
  { id: 11, name: 'One-handed catch', category: 'Object Control - Upper' },
  { id: 12, name: 'Hand dribble', category: 'Object Control - Upper' },
  { id: 13, name: 'Kick ball', category: 'Object Control - Lower' },
  { id: 14, name: 'Foot dribble', category: 'Object Control - Lower' },
  { id: 15, name: 'Balance walk forward', category: 'Balance & Stability' },
  { id: 16, name: 'Balance walk backward', category: 'Balance & Stability' },
  { id: 17, name: 'Drop and get up', category: 'Balance & Stability' },
  { id: 18, name: 'Lift and lower', category: 'Balance & Stability' },
];

type Grade = 'initial' | 'emerging' | 'developing' | 'proficient';

interface SkillGrade {
  skillId: number;
  grade: Grade;
  notes: string;
}

export default function AssessmentScreen() {
  const { athleteId } = useLocalSearchParams<{ athleteId: string }>();
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Step 1 - Pre-test
  const [parqCompleted, setParqCompleted] = useState(false);
  const [dataProtection, setDataProtection] = useState(false);
  const [guardianSigned, setGuardianSigned] = useState(false);
  
  // Step 2 - Warmup
  const [warmupTime, setWarmupTime] = useState(15 * 60); // 15 minutes
  const [warmupStarted, setWarmupStarted] = useState(false);
  
  // Step 3 - Skills
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0);
  const [skillGrades, setSkillGrades] = useState<SkillGrade[]>([]);
  
  // Step 4 - Psychological
  const [psychAnswers, setPsychAnswers] = useState<{ [key: number]: any }>({});
  
  // Step 5 - Cooldown
  const [cooldownTime, setCooldownTime] = useState(10 * 60); // 10 minutes

  const loadAthlete = useCallback(async () => {
    const data = await fetchAthleteById(athleteId!);
    if (data) setAthlete(data);
  }, [athleteId]);

  useEffect(() => {
    loadAthlete();
  }, [loadAthlete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNextStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete assessment
      router.push(`/coach/talent-report/${athleteId}`);
    }
  };

  const handleGradeSkill = (grade: Grade) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const skill = MOVEMENT_SKILLS[currentSkillIndex];
    const existingIndex = skillGrades.findIndex(s => s.skillId === skill.id);
    
    if (existingIndex >= 0) {
      setSkillGrades(prev => prev.map((s, i) => 
        i === existingIndex ? { ...s, grade } : s
      ));
    } else {
      setSkillGrades(prev => [...prev, { skillId: skill.id, grade, notes: '' }]);
    }
  };

  const handleNextSkill = () => {
    if (currentSkillIndex < MOVEMENT_SKILLS.length - 1) {
      setCurrentSkillIndex(prev => prev + 1);
    }
  };

  const handlePrevSkill = () => {
    if (currentSkillIndex > 0) {
      setCurrentSkillIndex(prev => prev - 1);
    }
  };

  const getCurrentSkillGrade = () => {
    const skill = MOVEMENT_SKILLS[currentSkillIndex];
    return skillGrades.find(s => s.skillId === skill.id)?.grade;
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return parqCompleted && dataProtection && guardianSigned;
      case 1: return warmupTime === 0 || !warmupStarted;
      case 2: return skillGrades.length === MOVEMENT_SKILLS.length;
      case 3: return Object.keys(psychAnswers).length >= 3;
      case 4: return true;
      default: return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <PreTestStep 
        parqCompleted={parqCompleted}
        setParqCompleted={setParqCompleted}
        dataProtection={dataProtection}
        setDataProtection={setDataProtection}
        guardianSigned={guardianSigned}
        setGuardianSigned={setGuardianSigned}
      />;
      case 1: return <WarmupStep 
        warmupTime={warmupTime}
        warmupStarted={warmupStarted}
        setWarmupStarted={setWarmupStarted}
        formatTime={formatTime}
      />;
      case 2: return <SkillsStep
        currentSkillIndex={currentSkillIndex}
        currentGrade={getCurrentSkillGrade()}
        onGrade={handleGradeSkill}
        onNext={handleNextSkill}
        onPrev={handlePrevSkill}
        totalGraded={skillGrades.length}
      />;
      case 3: return <PsychologicalStep
        answers={psychAnswers}
        setAnswers={setPsychAnswers}
      />;
      case 4: return <CooldownStep
        cooldownTime={cooldownTime}
        formatTime={formatTime}
        skillGrades={skillGrades}
      />;
      default: return null;
    }
  };

  const stepTitles = ['Pre-Test', 'Warmup', 'Skills', 'Questionnaire', 'Summary'];

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Assessment',
          headerBackTitle: 'Cancel',
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerTintColor: colors.foreground,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.stepIndicators}>
            {stepTitles.map((title, index) => (
              <View key={title} style={styles.stepIndicator}>
                <View style={[
                  styles.stepDot,
                  index <= currentStep && styles.stepDotActive,
                  index < currentStep && styles.stepDotComplete,
                ]}>
                  {index < currentStep ? (
                    <Ionicons name="checkmark" size={12} color={colors.neutral[0]} />
                  ) : (
                    <Text 
                      variant="caption" 
                      weight="semibold" 
                      color={index <= currentStep ? colors.neutral[0] : colors.foregroundMuted}
                    >
                      {index + 1}
                    </Text>
                  )}
                </View>
                <Text 
                  variant="caption" 
                  color={index <= currentStep ? colors.foreground : colors.foregroundMuted}
                  style={styles.stepLabel}
                >
                  {title}
                </Text>
              </View>
            ))}
          </View>
          <ProgressBar 
            progress={(currentStep + 1) / 5 * 100} 
            height={3}
            color={colors.primary[600]}
            style={styles.progressBar}
          />
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            key={currentStep}
            entering={FadeIn.duration(200)}
          >
            {renderStep()}
          </Animated.View>
        </ScrollView>

        {/* Actions */}
        <View style={styles.actions}>
          {currentStep > 0 && currentStep < 4 && (
            <Button
              title="Back"
              variant="outline"
              size="lg"
              onPress={() => setCurrentStep(prev => prev - 1)}
              style={styles.backButton}
            />
          )}
          <Button
            title={currentStep === 4 ? 'Generate Report' : 'Continue'}
            variant="primary"
            size="lg"
            onPress={handleNextStep}
            disabled={!isStepValid()}
            style={styles.continueButton}
          />
        </View>
      </SafeAreaView>
    </>
  );
}

// Step 1: Pre-Test Checklist
function PreTestStep({ 
  parqCompleted, setParqCompleted,
  dataProtection, setDataProtection,
  guardianSigned, setGuardianSigned,
}: any) {
  return (
    <View>
      <Text variant="h4" weight="semibold" style={styles.stepTitle}>
        Pre-Test Checklist
      </Text>
      <Text variant="body" color={colors.foregroundMuted} style={styles.stepDescription}>
        Complete all requirements before starting the assessment.
      </Text>

      <View style={styles.checklistContainer}>
        <ChecklistItem
          title="PAR-Q Completion"
          description="Physical Activity Readiness Questionnaire"
          checked={parqCompleted}
          onToggle={() => setParqCompleted(!parqCompleted)}
        />
        <ChecklistItem
          title="Data Protection Agreement"
          description="Consent to collect and process data"
          checked={dataProtection}
          onToggle={() => setDataProtection(!dataProtection)}
        />
        <ChecklistItem
          title="Guardian Signature"
          description="Required for athletes under 18"
          checked={guardianSigned}
          onToggle={() => setGuardianSigned(!guardianSigned)}
        />
      </View>
    </View>
  );
}

// Step 2: Warmup Timer
function WarmupStep({ warmupTime, warmupStarted, setWarmupStarted, formatTime }: any) {
  return (
    <View style={styles.timerContainer}>
      <Text variant="h4" weight="semibold" style={styles.stepTitle}>
        Warmup
      </Text>
      <Text variant="body" color={colors.foregroundMuted} style={styles.stepDescription}>
        Complete a 15-minute warmup before beginning the assessment.
      </Text>

      <View style={styles.timerDisplay}>
        <Text variant="h1" weight="bold" style={styles.timerText}>
          {formatTime(warmupTime)}
        </Text>
        <Text variant="body" color={colors.foregroundMuted}>
          {warmupTime > 0 ? 'remaining' : 'Complete!'}
        </Text>
      </View>

      {!warmupStarted && (
        <Button
          title="Start Warmup"
          variant="primary"
          size="lg"
          onPress={() => setWarmupStarted(true)}
          style={styles.timerButton}
        />
      )}

      <View style={styles.warmupInstructions}>
        <Text variant="body" weight="semibold" style={styles.instructionTitle}>
          Warmup Activities
        </Text>
        <View style={styles.instructionList}>
          <Text variant="bodySmall" color={colors.foregroundSecondary}>• Light jogging - 3 minutes</Text>
          <Text variant="bodySmall" color={colors.foregroundSecondary}>• Dynamic stretches - 5 minutes</Text>
          <Text variant="bodySmall" color={colors.foregroundSecondary}>• Movement preparation - 4 minutes</Text>
          <Text variant="bodySmall" color={colors.foregroundSecondary}>• Activation exercises - 3 minutes</Text>
        </View>
      </View>
    </View>
  );
}

// Step 3: Skills Assessment
function SkillsStep({ 
  currentSkillIndex, 
  currentGrade, 
  onGrade, 
  onNext, 
  onPrev,
  totalGraded,
}: any) {
  const skill = MOVEMENT_SKILLS[currentSkillIndex];
  const grades: { value: Grade; label: string; color: string }[] = [
    { value: 'initial', label: 'Initial', color: colors.neutral[400] },
    { value: 'emerging', label: 'Emerging', color: colors.warning.main },
    { value: 'developing', label: 'Developing', color: colors.info.main },
    { value: 'proficient', label: 'Proficient', color: colors.success.main },
  ];

  return (
    <View>
      <View style={styles.skillHeader}>
        <Text variant="bodySmall" color={colors.foregroundMuted}>
          Skill {currentSkillIndex + 1} of {MOVEMENT_SKILLS.length}
        </Text>
        <Badge label={`${totalGraded} graded`} variant="default" />
      </View>

      <View style={styles.skillCard}>
        <Badge label={skill.category} variant="primary" size="sm" />
        <Text variant="h4" weight="semibold" style={styles.skillName}>
          {skill.name}
        </Text>

        <View style={styles.gradeButtons}>
          {grades.map(grade => (
            <Pressable
              key={grade.value}
              style={[
                styles.gradeButton,
                currentGrade === grade.value && { 
                  backgroundColor: grade.color,
                  borderColor: grade.color,
                },
              ]}
              onPress={() => onGrade(grade.value)}
            >
              <Text 
                variant="bodySmall" 
                weight="medium"
                color={currentGrade === grade.value ? colors.neutral[0] : colors.foreground}
              >
                {grade.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.skillNavigation}>
        <Pressable 
          style={[styles.navButton, currentSkillIndex === 0 && styles.navButtonDisabled]}
          onPress={onPrev}
          disabled={currentSkillIndex === 0}
        >
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
          <Text variant="body">Previous</Text>
        </Pressable>
        <Pressable 
          style={[styles.navButton, currentSkillIndex === MOVEMENT_SKILLS.length - 1 && styles.navButtonDisabled]}
          onPress={onNext}
          disabled={currentSkillIndex === MOVEMENT_SKILLS.length - 1}
        >
          <Text variant="body">Next</Text>
          <Ionicons name="chevron-forward" size={24} color={colors.foreground} />
        </Pressable>
      </View>
    </View>
  );
}

// Step 4: Psychological Questionnaire
function PsychologicalStep({ answers, setAnswers }: any) {
  const questions = [
    { id: 1, question: 'How confident do you feel during training?', type: 'slider' },
    { id: 2, question: 'What motivates you most?', type: 'choice', options: ['Winning', 'Improving', 'Friends', 'Family'] },
    { id: 3, question: 'Which sports interest you?', type: 'multi', options: ['Football', 'Basketball', 'Athletics', 'Swimming'] },
  ];

  return (
    <View>
      <Text variant="h4" weight="semibold" style={styles.stepTitle}>
        Questionnaire
      </Text>
      <Text variant="body" color={colors.foregroundMuted} style={styles.stepDescription}>
        Help us understand the athlete's motivation and interests.
      </Text>

      {questions.map(q => (
        <View key={q.id} style={styles.questionCard}>
          <Text variant="body" weight="medium" style={styles.questionText}>
            {q.question}
          </Text>
          
          {q.type === 'choice' && (
            <View style={styles.optionsContainer}>
              {q.options?.map(opt => (
                <Pressable
                  key={opt}
                  style={[
                    styles.optionButton,
                    answers[q.id] === opt && styles.optionButtonActive,
                  ]}
                  onPress={() => setAnswers({ ...answers, [q.id]: opt })}
                >
                  <Text 
                    variant="bodySmall"
                    color={answers[q.id] === opt ? colors.primary[600] : colors.foreground}
                  >
                    {opt}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {q.type === 'multi' && (
            <View style={styles.optionsContainer}>
              {q.options?.map(opt => {
                const selected = answers[q.id]?.includes(opt);
                return (
                  <Pressable
                    key={opt}
                    style={[styles.optionButton, selected && styles.optionButtonActive]}
                    onPress={() => {
                      const current = answers[q.id] || [];
                      const updated = selected 
                        ? current.filter((o: string) => o !== opt)
                        : [...current, opt];
                      setAnswers({ ...answers, [q.id]: updated });
                    }}
                  >
                    <Text 
                      variant="bodySmall"
                      color={selected ? colors.primary[600] : colors.foreground}
                    >
                      {opt}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {q.type === 'slider' && (
            <View style={styles.sliderContainer}>
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <Pressable
                  key={n}
                  style={[
                    styles.sliderDot,
                    answers[q.id] === n && styles.sliderDotActive,
                  ]}
                  onPress={() => setAnswers({ ...answers, [q.id]: n })}
                >
                  <Text variant="caption" color={answers[q.id] === n ? colors.neutral[0] : colors.foregroundMuted}>
                    {n}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

// Sport recommendations based on skill profile
const SPORT_RECOMMENDATIONS = [
  { sport: 'Athletics', icon: 'walk', strengths: ['Running', 'Balance & Stability'] },
  { sport: 'Basketball', icon: 'basketball', strengths: ['Object Control - Upper', 'Locomotor Control'] },
  { sport: 'Football', icon: 'football', strengths: ['Object Control - Lower', 'Running'] },
  { sport: 'Gymnastics', icon: 'body', strengths: ['Balance & Stability', 'Locomotor Control'] },
  { sport: 'Swimming', icon: 'water', strengths: ['Locomotor Control', 'Balance & Stability'] },
  { sport: 'Tennis', icon: 'tennisball', strengths: ['Object Control - Upper', 'Balance & Stability'] },
];

// Step 5: Cooldown & Summary with Sport Recommendations
function CooldownStep({ cooldownTime, formatTime, skillGrades }: any) {
  const gradeCounts = {
    initial: skillGrades.filter((s: SkillGrade) => s.grade === 'initial').length,
    emerging: skillGrades.filter((s: SkillGrade) => s.grade === 'emerging').length,
    developing: skillGrades.filter((s: SkillGrade) => s.grade === 'developing').length,
    proficient: skillGrades.filter((s: SkillGrade) => s.grade === 'proficient').length,
  };

  // Calculate category scores based on graded skills
  const getCategoryScores = () => {
    const categories: { [key: string]: { total: number; count: number } } = {};
    
    skillGrades.forEach((sg: SkillGrade) => {
      const skill = MOVEMENT_SKILLS.find(s => s.id === sg.skillId);
      if (skill) {
        if (!categories[skill.category]) {
          categories[skill.category] = { total: 0, count: 0 };
        }
        const gradeValue = sg.grade === 'proficient' ? 100 : 
                          sg.grade === 'developing' ? 75 : 
                          sg.grade === 'emerging' ? 50 : 25;
        categories[skill.category].total += gradeValue;
        categories[skill.category].count++;
      }
    });

    return Object.entries(categories).map(([cat, data]) => ({
      category: cat,
      score: Math.round(data.total / data.count),
    })).sort((a, b) => b.score - a.score);
  };

  const categoryScores = getCategoryScores();
  const topCategories = categoryScores.slice(0, 2).map(c => c.category);

  // Find recommended sports based on top categories
  const recommendedSports = SPORT_RECOMMENDATIONS
    .map(sport => {
      const matchScore = sport.strengths.filter(s => topCategories.includes(s)).length;
      const avgCategoryScore = sport.strengths.reduce((acc, str) => {
        const cat = categoryScores.find(c => c.category === str);
        return acc + (cat?.score || 50);
      }, 0) / sport.strengths.length;
      
      return {
        ...sport,
        matchPercentage: Math.round((matchScore / 2) * 40 + avgCategoryScore * 0.6),
      };
    })
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, 3);

  return (
    <View>
      <Text variant="h4" weight="semibold" style={styles.stepTitle}>
        Cooldown & Summary
      </Text>

      <View style={styles.cooldownTimer}>
        <Text variant="h2" weight="bold">
          {formatTime(cooldownTime)}
        </Text>
        <Text variant="bodySmall" color={colors.foregroundMuted}>
          Cooldown time remaining
        </Text>
      </View>

      {/* Assessment Stats */}
      <View style={styles.summaryCard}>
        <Text variant="body" weight="semibold" style={styles.summaryTitle}>
          Assessment Summary
        </Text>
        <View style={styles.summaryStats}>
          <View style={styles.summaryStat}>
            <Text variant="h4" weight="bold">{skillGrades.length}</Text>
            <Text variant="caption" color={colors.foregroundMuted}>Skills Graded</Text>
          </View>
          <View style={styles.summaryStat}>
            <Text variant="h4" weight="bold" color={colors.success.dark}>{gradeCounts.proficient}</Text>
            <Text variant="caption" color={colors.foregroundMuted}>Proficient</Text>
          </View>
          <View style={styles.summaryStat}>
            <Text variant="h4" weight="bold" color={colors.info.dark}>{gradeCounts.developing}</Text>
            <Text variant="caption" color={colors.foregroundMuted}>Developing</Text>
          </View>
        </View>
      </View>

      {/* Sport Recommendations */}
      {skillGrades.length > 0 && (
        <View style={styles.sportRecommendations}>
          <Text variant="body" weight="semibold" style={styles.summaryTitle}>
            Recommended Sports
          </Text>
          <Text variant="bodySmall" color={colors.foregroundMuted} style={styles.recommendationSubtitle}>
            Based on assessed movement skills
          </Text>
          
          {recommendedSports.map((sport, index) => (
            <View key={sport.sport} style={styles.sportRecommendationItem}>
              <View style={styles.sportRecommendationLeft}>
                <View style={[styles.sportRank, index === 0 && styles.sportRankTop]}>
                  <Text 
                    variant="caption" 
                    weight="bold" 
                    color={index === 0 ? colors.neutral[0] : colors.foregroundMuted}
                  >
                    {index + 1}
                  </Text>
                </View>
                <View style={styles.sportIconContainer}>
                  <Ionicons name={sport.icon as any} size={20} color={colors.foreground} />
                </View>
                <View>
                  <Text variant="body" weight="medium">{sport.sport}</Text>
                  <Text variant="caption" color={colors.foregroundMuted}>
                    {sport.strengths.join(' • ')}
                  </Text>
                </View>
              </View>
              <View style={styles.sportMatchBadge}>
                <Text variant="body" weight="bold" color={colors.success.dark}>
                  {sport.matchPercentage}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Top Categories */}
      {categoryScores.length > 0 && (
        <View style={styles.topCategoriesCard}>
          <Text variant="body" weight="semibold" style={styles.summaryTitle}>
            Strongest Areas
          </Text>
          {categoryScores.slice(0, 3).map((cat, index) => (
            <View key={cat.category} style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <Ionicons 
                  name={index === 0 ? 'star' : 'star-outline'} 
                  size={16} 
                  color={index === 0 ? colors.warning.main : colors.foregroundMuted} 
                />
                <Text variant="bodySmall">{cat.category}</Text>
              </View>
              <View style={styles.categoryScore}>
                <ProgressBar 
                  progress={cat.score} 
                  height={6} 
                  color={cat.score >= 75 ? colors.success.main : cat.score >= 50 ? colors.warning.main : colors.neutral[400]}
                  style={styles.categoryProgress}
                />
                <Text variant="bodySmall" weight="semibold">{cat.score}%</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// Checklist Item Component
function ChecklistItem({ title, description, checked, onToggle }: any) {
  return (
    <Pressable style={styles.checklistItem} onPress={onToggle}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Ionicons name="checkmark" size={16} color={colors.neutral[0]} />}
      </View>
      <View style={styles.checklistContent}>
        <Text variant="body" weight="medium">{title}</Text>
        <Text variant="caption" color={colors.foregroundMuted}>{description}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressContainer: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  stepIndicator: {
    alignItems: 'center',
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[1],
  },
  stepDotActive: {
    backgroundColor: colors.primary[600],
  },
  stepDotComplete: {
    backgroundColor: colors.success.main,
  },
  stepLabel: {
    fontSize: 10,
  },
  progressBar: {
    marginTop: spacing[2],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  stepTitle: {
    marginBottom: spacing[2],
  },
  stepDescription: {
    marginBottom: spacing[6],
  },
  checklistContainer: {
    gap: spacing[3],
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  checkboxChecked: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  checklistContent: {
    flex: 1,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerDisplay: {
    alignItems: 'center',
    marginVertical: spacing[8],
  },
  timerText: {
    fontSize: 64,
  },
  timerButton: {
    minWidth: 200,
  },
  warmupInstructions: {
    marginTop: spacing[8],
    width: '100%',
    padding: spacing[4],
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.xl,
  },
  instructionTitle: {
    marginBottom: spacing[3],
  },
  instructionList: {
    gap: spacing[2],
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  skillCard: {
    padding: spacing[6],
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  skillName: {
    marginTop: spacing[3],
    marginBottom: spacing[6],
    textAlign: 'center',
  },
  gradeButtons: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  gradeButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  skillNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing[6],
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    padding: spacing[2],
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  questionCard: {
    padding: spacing[4],
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing[4],
  },
  questionText: {
    marginBottom: spacing[4],
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  optionButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
  },
  optionButtonActive: {
    backgroundColor: colors.primary[50],
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderDotActive: {
    backgroundColor: colors.primary[600],
  },
  cooldownTimer: {
    alignItems: 'center',
    paddingVertical: spacing[6],
  },
  summaryCard: {
    padding: spacing[4],
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing[4],
  },
  summaryTitle: {
    marginBottom: spacing[3],
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStat: {
    alignItems: 'center',
  },
  sportRecommendations: {
    padding: spacing[4],
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing[4],
  },
  recommendationSubtitle: {
    marginBottom: spacing[4],
  },
  sportRecommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  sportRecommendationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  sportRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sportRankTop: {
    backgroundColor: colors.primary[600],
  },
  sportIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sportMatchBadge: {
    paddingHorizontal: spacing[2],
  },
  topCategoriesCard: {
    padding: spacing[4],
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[2],
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
  },
  categoryScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  categoryProgress: {
    width: 80,
  },
  actions: {
    flexDirection: 'row',
    padding: spacing[4],
    gap: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  backButton: {
    flex: 1,
  },
  continueButton: {
    flex: 2,
  },
});

