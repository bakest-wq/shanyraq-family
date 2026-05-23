import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MessagePreview } from '@/components/congratulations/MessagePreview';
import { StyleSelector } from '@/components/congratulations/StyleSelector';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { AvatarPlaceholder } from '@/components/ui/RelativeCard';
import { useRelative } from '@/hooks/useRelatives';
import { congratulationsService } from '@/services/congratulations.service';
import { CongratulationsStyle } from '@/types/congratulations';
import {
  calculateAge,
  formatBirthdayKzRu,
  getAgeTurningOnNextBirthday,
} from '@/utils/dates';
import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

export default function CongratulationsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const relativeId = Array.isArray(id) ? id[0] : id;
  const { relative, loading } = useRelative(relativeId ?? '');

  const [style, setStyle] = useState<CongratulationsStyle>('warm-family');
  const [seed, setSeed] = useState(Date.now());

  const ageTurning = useMemo(() => {
    if (!relative) {
      return null;
    }

    return getAgeTurningOnNextBirthday(relative.birthday) ?? calculateAge(relative.birthday);
  }, [relative]);

  const congratulationInput = useMemo(() => {
    if (!relative) {
      return null;
    }

    return congratulationsService.buildInputFromRelative(relative, ageTurning);
  }, [relative, ageTurning]);

  const message = useMemo(() => {
    if (!congratulationInput) {
      return '';
    }

    return congratulationsService.generate(style, congratulationInput, seed);
  }, [congratulationInput, style, seed]);

  const regenerate = useCallback(() => {
    setSeed(Date.now());
  }, []);

  useEffect(() => {
    regenerate();
  }, [style, regenerate]);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(message);
    Alert.alert('Скопировано', 'Поздравление скопировано в буфер обмена.');
  };

  const handleWhatsApp = () => {
    if (!relative?.phone) {
      Alert.alert('Телефон жоқ', 'Добавьте номер телефона родственника.');
      return;
    }

    const digits = relative.phone.replace(/\D/g, '');
    Linking.openURL(`https://wa.me/${digits}?text=${encodeURIComponent(message)}`);
  };

  if (!relativeId) {
    return null;
  }

  if (loading && !relative) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingState message="Жүктелуде..." />
      </SafeAreaView>
    );
  }

  if (!relative || !congratulationInput) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Родственник не найден</Text>
          <PrimaryButton label="Назад" variant="gold" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Артқа · Назад</Text>
        </Pressable>

        <Text style={styles.title}>AI поздравление</Text>
        <Text style={styles.subtitle}>Красивое поздравление для семьи</Text>

        <Card goldBorder style={styles.personCard}>
          <AvatarPlaceholder
            name={relative.fullName}
            color={relative.avatarColor}
            size={72}
          />
          <View style={styles.personInfo}>
            <Text style={styles.personName}>{relative.fullName}</Text>
            <Text style={styles.personMeta}>{relative.relationship}</Text>
            <Text style={styles.personMeta}>{formatBirthdayKzRu(relative.birthday)}</Text>
            {ageTurning !== null ? (
              <Text style={styles.personAge}>Исполнится {ageTurning} лет</Text>
            ) : null}
          </View>
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Стиль · Стиль поздравления</Text>
          <StyleSelector value={style} onChange={setStyle} />
        </View>

        <MessagePreview message={message} />

        <View style={styles.actions}>
          <PrimaryButton label="Скопировать" variant="gold" onPress={() => void handleCopy()} />
          <PrimaryButton label="Отправить в WhatsApp" variant="green" onPress={handleWhatsApp} />
          <PrimaryButton
            label="Сгенерировать заново"
            sublabel="Жаңа нұсқа · New version"
            variant="gold"
            onPress={regenerate}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.cream,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.sm,
  },
  backText: {
    ...Typography.body,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
  title: {
    ...Typography.hero,
    color: Palette.greenDeep,
  },
  subtitle: {
    ...Typography.body,
    color: Palette.textSecondary,
  },
  personCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
    ...Shadow.card,
  },
  personInfo: {
    flex: 1,
    gap: 2,
  },
  personName: {
    ...Typography.subtitle,
    color: Palette.textPrimary,
  },
  personMeta: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
  },
  personAge: {
    ...Typography.bodySmall,
    color: Palette.greenMid,
    fontWeight: '700',
  },
  section: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  actions: {
    gap: Spacing.sm,
  },
  errorText: {
    ...Typography.body,
    color: Palette.danger,
    textAlign: 'center',
  },
});
