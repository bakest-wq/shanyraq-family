import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';
import { DetailField } from '@/components/ui/DetailField';
import { LoadingState } from '@/components/ui/LoadingState';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { AvatarPlaceholder } from '@/components/ui/RelativeCard';
import { useDeleteRelative, useRelative } from '@/hooks/useRelatives';
import { calculateAge, formatBirthdayKzRu, getAgeLabel } from '@/utils/dates';
import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

export default function RelativeDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const relativeId = Array.isArray(id) ? id[0] : id;
  const { relative, loading, error } = useRelative(relativeId ?? '');
  const { deleteRelativeAndLeave, deleting } = useDeleteRelative();

  if (!relativeId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Родственник не найден</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading && !relative) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingState message="Жүктелуде · Загрузка..." />
      </SafeAreaView>
    );
  }

  if (error || !relative) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error ?? 'Родственник не найден'}</Text>
          <PrimaryButton label="Назад" variant="gold" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const age = calculateAge(relative.birthday);

  const handleCall = () => {
    if (!relative.phone) {
      Alert.alert('Телефон жоқ', 'Номер телефона не указан.');
      return;
    }
    Linking.openURL(`tel:${relative.phone}`);
  };

  const handleWhatsApp = () => {
    if (!relative.phone) {
      Alert.alert('Телефон жоқ', 'Номер телефона не указан.');
      return;
    }
    const digits = relative.phone.replace(/\D/g, '');
    Linking.openURL(
      `https://wa.me/${digits}?text=${encodeURIComponent(`Ассалаумағалейкум, ${relative.fullName}!`)}`,
    );
  };

  const handleEdit = () => {
    router.push({
      pathname: '/edit-relative/[id]',
      params: { id: relative.id },
    });
  };

  const handleCongratulations = () => {
    router.push({
      pathname: '/congratulations/[id]',
      params: { id: relative.id },
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Удалить родственника?',
      'Вы точно хотите удалить этого родственника?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => void deleteRelativeAndLeave(relative.id),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Артқа · Назад</Text>
        </Pressable>

        <Card goldBorder style={styles.heroCard}>
          <AvatarPlaceholder
            name={relative.fullName}
            color={relative.avatarColor}
            size={96}
            deceased={relative.isDeceased}
          />
          <Text style={styles.relationship}>{relative.relationship}</Text>
          <Text style={styles.name}>{relative.fullName}</Text>
          {relative.isDeceased ? (
            <View style={styles.deceasedBadge}>
              <Text style={styles.deceasedBadgeText}>🕊️ Марқұм</Text>
            </View>
          ) : null}
        </Card>

        <Card style={styles.detailsCard}>
          <DetailField label="Туған күні · Дата рождения" value={formatBirthdayKzRu(relative.birthday)} />
          <DetailField
            label="Жасы · Возраст"
            value={age !== null ? getAgeLabel(age) : '—'}
          />
          <DetailField label="Телефон · Phone" value={relative.phone || '—'} />
          <DetailField
            label="Марқұм · Ушедший"
            value={relative.isDeceased ? 'Иә · Да' : 'Жоқ · Нет'}
          />
          {relative.isDeceased ? (
            <>
              <DetailField
                label="Жыл · Год смерти"
                value={relative.deathYear ? String(relative.deathYear) : '—'}
              />
              <DetailField
                label="Дұға · Dua text"
                value={relative.duaText || '—'}
                multiline
              />
            </>
          ) : null}
          <DetailField
            label="Ескертпе · Notes"
            value={relative.notes || '—'}
            multiline
          />
        </Card>

        <View style={styles.actionsGrid}>
          <PrimaryButton label="Позвонить" variant="green" onPress={handleCall} />
          <PrimaryButton label="WhatsApp" variant="gold" onPress={handleWhatsApp} />
          {!relative.isDeceased ? (
            <PrimaryButton
              label="AI поздравление"
              variant="gold"
              onPress={handleCongratulations}
            />
          ) : null}
          <PrimaryButton label="Редактировать" variant="gold" onPress={handleEdit} />
          <PrimaryButton
            label={deleting ? 'Удаление...' : 'Удалить'}
            variant="danger"
            onPress={deleting ? undefined : handleDelete}
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
  heroCard: {
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadow.card,
  },
  relationship: {
    ...Typography.caption,
    color: Palette.gold,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: Spacing.sm,
  },
  name: {
    ...Typography.hero,
    color: Palette.greenDeep,
    textAlign: 'center',
  },
  deceasedBadge: {
    marginTop: Spacing.sm,
    backgroundColor: Palette.creamDark,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  deceasedBadgeText: {
    ...Typography.caption,
    color: Palette.textSecondary,
    fontWeight: '700',
  },
  detailsCard: {
    gap: 0,
    ...Shadow.soft,
  },
  actionsGrid: {
    gap: Spacing.sm,
  },
  errorText: {
    ...Typography.body,
    color: Palette.danger,
    textAlign: 'center',
  },
});
