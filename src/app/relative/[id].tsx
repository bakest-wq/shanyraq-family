import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import { Alert, Animated, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  RelativeProfileActions,
  RelativeProfileFamilySection,
  RelativeProfileHeader,
  RelativeProfileInfoSection,
  RelativeProfileMemorialSection,
  RelativeProfileMemoriesSection,
  RelativeProfileNotesSection,
  RelativeProfileShezhireSection,
  RelativeProfileTopBar,
} from '@/components/relatives/profile';
import { SuggestedLinksSection } from '@/components/relatives/SuggestedLinksSection';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { useDeleteRelative, useRelative, useRelatives } from '@/hooks/useRelatives';
import { useRelativePhoto } from '@/hooks/useRelativePhoto';
import {
  findFamilyAnchor,
  formatRelationshipPath,
  getChildrenOf,
  getRelationshipPath,
} from '@/utils/kinship-path';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { getKinshipPathSubtitle } from '@/utils/relative-profile';
import { MaxContentWidth, Palette, Spacing } from '@/constants/theme';

export default function RelativeDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const relativeId = Array.isArray(id) ? id[0] : id;
  const { relative, loading, error } = useRelative(relativeId ?? '');
  const { relatives } = useRelatives();
  const { deleteRelativeAndLeave, deleting } = useDeleteRelative();
  const { uploading: photoUploading, pickAndUploadPhoto, removePhoto } = useRelativePhoto(relative);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const displayName = relative ? getRelativeDisplayName(relative) : '';
  const kinshipSubtitle = useMemo(() => {
    if (!relative) {
      return null;
    }

    const anchor = findFamilyAnchor(relatives);
    const path = formatRelationshipPath(getRelationshipPath(relative, relatives, anchor));
    return getKinshipPathSubtitle(path, relative.relationship);
  }, [relative, relatives]);

  const children = useMemo(() => {
    if (!relative) {
      return [];
    }

    return getChildrenOf(relative.id, relatives);
  }, [relative, relatives]);

  useEffect(() => {
    if (!relative) {
      fadeAnim.setValue(0);
      return;
    }

    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, relative?.id]);

  const handleOpenRelative = (targetId: string) => {
    if (!targetId || targetId === relativeId) {
      return;
    }

    router.push({
      pathname: '/relative/[id]',
      params: { id: targetId },
    });
  };

  const handleEdit = () => {
    if (!relative) {
      return;
    }

    router.push({
      pathname: '/edit-relative/[id]',
      params: { id: relative.id },
    });
  };

  const handleCall = () => {
    if (!relative?.phone) {
      Alert.alert('Телефон жоқ', 'Номер телефона не указан.');
      return;
    }

    Linking.openURL(`tel:${relative.phone}`);
  };

  const handleCongratulations = () => {
    if (!relative) {
      return;
    }

    router.push({
      pathname: '/congratulations/[id]',
      params: { id: relative.id },
    });
  };

  const handleDelete = () => {
    if (!relative) {
      return;
    }

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

  if (!relativeId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.stateWrap}>
          <EmptyState
            icon="👤"
            title="Родственник не найден"
            subtitle="Туыс табылмады · Проверьте ссылку"
            actionLabel="Артқа · Назад"
            onAction={() => router.back()}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (loading && !relative) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <RelativeProfileTopBar onBack={() => router.back()} editDisabled />
        <LoadingState message="Жүктелуде · Загрузка профиля..." />
      </SafeAreaView>
    );
  }

  if (error || !relative) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <RelativeProfileTopBar onBack={() => router.back()} editDisabled />
        <View style={styles.stateWrap}>
          <EmptyState
            icon="⚠️"
            title="Профиль жүктелмеді"
            subtitle={error ?? 'Родственник не найден'}
            actionLabel="Артқа · Назад"
            onAction={() => router.back()}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <RelativeProfileTopBar onBack={() => router.back()} onEdit={handleEdit} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <RelativeProfileHeader
            relative={relative}
            relatives={relatives}
            displayName={displayName}
            kinshipSubtitle={kinshipSubtitle}
            uploading={photoUploading}
            onPickPhoto={() => void pickAndUploadPhoto()}
            onRemovePhoto={removePhoto}
          />

          <SuggestedLinksSection subjectId={relative.id} limit={4} />

          <RelativeProfileInfoSection relative={relative} onCallPhone={handleCall} />

          <RelativeProfileFamilySection
            relative={relative}
            relatives={relatives}
            children={children}
            onOpenRelative={handleOpenRelative}
          />

          <RelativeProfileShezhireSection relative={relative} />

          <RelativeProfileNotesSection notes={relative.notes} />

          <RelativeProfileMemoriesSection relative={relative} />

          {relative.isDeceased ? <RelativeProfileMemorialSection relative={relative} /> : null}

          <RelativeProfileActions
            relative={relative}
            displayName={displayName}
            deleting={deleting}
            onCongratulations={handleCongratulations}
            onDelete={handleDelete}
          />
        </Animated.View>
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
  },
  content: {
    gap: Spacing.lg,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    paddingTop: Spacing.sm,
  },
  stateWrap: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
});
