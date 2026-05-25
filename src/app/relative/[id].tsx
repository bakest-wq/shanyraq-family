import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FamilyStorySection } from '@/components/relatives/profile/FamilyStorySection';
import { RootPersonIdentityBanner } from '@/components/identity/RootPersonIdentityBanner';
import {
  RelativeProfileFamilyRing,
  RelativeProfileFooterActions,
  RelativeProfileHeader,
  RelativeProfileMemorialSection,
  RelativeProfileMemoriesSection,
  RelativeProfileNotesSection,
  RelativeProfilePrimaryActions,
  RelativeProfileShezhireSection,
  RelativeProfileTopBar,
} from '@/components/relatives/profile';
import { RelativeDeleteConfirmModal } from '@/components/relatives/profile/RelativeDeleteConfirmModal';
import { EditOwnershipLine } from '@/components/trust/EditOwnershipLine';
import { CalmDisclosure } from '@/components/ui/CalmDisclosure';
import { PresetEmptyState } from '@/components/ui/EmptyState';
import { FadeTransition } from '@/components/ui/motion/FadeTransition';
import { EMPTY_STATE_PRESETS } from '@/constants/family-ux-content';
import { Palette } from '@/constants/theme';
import { RELATIVE_PROFILE_COPY } from '@/constants/relative-profile-content';
import { LoadingState } from '@/components/ui/LoadingState';
import { useDeleteRelative, useRelative, useRelatives } from '@/hooks/useRelatives';
import { useRelativeDeleteFlow } from '@/hooks/useRelativeDeleteFlow';
import { useSafeGoBack } from '@/hooks/useSafeGoBack';
import { useFamilyPermissions } from '@/hooks/useFamilyPermissions';
import { useRecentPeople } from '@/hooks/useRecentPeople';
import { useRelativePhoto } from '@/hooks/useRelativePhoto';
import { useArchive } from '@/hooks/useArchive';
import { useFamilyStoryFromRoot } from '@/hooks/useFamilyStoryFromRoot';
import { useKinshipFromRoot } from '@/hooks/useKinshipFromRoot';
import { useKinshipAnchor } from '@/hooks/useKinshipAnchor';
import { useRelativesListPreparedView } from '@/hooks/useShezhirePreparedView';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { useCalmUx } from '@/hooks/useCalmUx';
import { getKinshipExplanation } from '@/services/kinship.service';
import { getPreparedKinshipLabel } from '@/services/shezhire-view.service';
import { buildEditRelativeHref } from '@/utils/edit-relative-navigation';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { FAMILY_SPACE_COPY } from '@/constants/family-space-content';
import { pickDefaultRootId } from '@/utils/focused-family-tree';
import { APP_ROUTES } from '@/utils/safe-navigation';
import {
  buildProfileFamilySummaries,
  isUnknownKinshipLabel,
} from '@/utils/profile-family-summary';
import { recordRelativeInteraction } from '@/services/relative-interaction-session';

export default function RelativeDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const relativeId = Array.isArray(id) ? id[0] : id;
  const { relative, loading, error } = useRelative(relativeId ?? '');
  const { relatives } = useRelatives();
  const { myRelative, myRelativeId } = useUserIdentity();
  const { deleteRelative, clearRelativeReferences, deleting } = useDeleteRelative();
  const { canEdit, canDelete } = useFamilyPermissions();
  const { recordView } = useRecentPeople();
  const { uploading: photoUploading, pickAndUploadPhoto, removePhoto } = useRelativePhoto(relative);
  const { calm, theme } = useCalmUx();
  const contentStyles = useMemo(() => createContentStyles(theme, calm), [calm, theme]);
  const goBack = useSafeGoBack(APP_ROUTES.relatives);

  const { startDelete, deleteModalProps } = useRelativeDeleteFlow({
    relative,
    relatives,
    deleteRelative,
    clearRelativeReferences,
    onDeleted: () => router.replace('/(tabs)/relatives'),
    treeRootId: pickDefaultRootId(relatives, myRelativeId),
    myRelativeId,
  });

  const anchorPerson = useKinshipAnchor();
  const { kinshipLabels } = useRelativesListPreparedView();
  const { memories } = useArchive();
  const kinshipMemoryContext = useMemo(
    () => ({ memories }),
    [memories],
  );
  const kinshipSnapshot = useKinshipFromRoot(relative ?? null, kinshipMemoryContext);
  const familyStory = useFamilyStoryFromRoot(relative ?? null);
  const displayName = relative ? getRelativeDisplayName(relative) : '';

  const kinshipDisplay = useMemo(() => {
    if (!relative || !anchorPerson || anchorPerson.id === relative.id) {
      return { label: null as string | null, detail: null as string | null, memoryLine: null };
    }

    const label =
      getPreparedKinshipLabel(kinshipLabels, anchorPerson, relative) ||
      kinshipSnapshot?.cardLine ||
      null;
    const explanation = kinshipSnapshot?.explanation ?? (
      anchorPerson && relative
        ? getKinshipExplanation(anchorPerson, relative, relatives)
        : null
    );

    const safeLabel = isUnknownKinshipLabel(label) ? null : label;
    const safeDetail =
      explanation && explanation.summary !== label && !isUnknownKinshipLabel(explanation.summary)
        ? explanation.summary
        : isUnknownKinshipLabel(label)
          ? RELATIVE_PROFILE_COPY.kinshipUnknownHint
          : null;

    return {
      label: safeLabel,
      detail: safeDetail,
      memoryLine: kinshipSnapshot?.memory?.line ?? null,
    };
  }, [anchorPerson, kinshipLabels, kinshipSnapshot, relative, relatives]);

  const familySummaries = useMemo(
    () => (relative ? buildProfileFamilySummaries(relative, relatives, anchorPerson) : []),
    [anchorPerson, relative, relatives],
  );

  useEffect(() => {
    if (!relative?.id) {
      return;
    }

    void recordView(relative.id);
    if (anchorPerson?.id) {
      recordRelativeInteraction(anchorPerson.id, relative.id);
    }
  }, [anchorPerson?.id, relative?.id, recordView]);

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
    if (!relative || !canEdit) {
      Alert.alert('', FAMILY_SPACE_COPY.suggestEditInstead);
      return;
    }

    router.push(buildEditRelativeHref(relative.id, 'details'));
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

    if (!canDelete) {
      Alert.alert('', FAMILY_SPACE_COPY.suggestDeleteInstead);
      return;
    }

    startDelete();
  };

  if (!relativeId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.stateWrap}>
          <PresetEmptyState
            preset={EMPTY_STATE_PRESETS.relativeNotFound}
            onAction={goBack}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (loading && !relative) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <RelativeProfileTopBar onBack={goBack} editDisabled />
        <LoadingState message="Профиль жүктелуде..." />
      </SafeAreaView>
    );
  }

  if (error || !relative) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <RelativeProfileTopBar onBack={goBack} editDisabled />
        <View style={styles.stateWrap}>
          <PresetEmptyState
            preset={EMPTY_STATE_PRESETS.relativeProfileFailed}
            onAction={goBack}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <RelativeProfileTopBar
        onBack={goBack}
        onEdit={canEdit ? handleEdit : undefined}
        editDisabled={!canEdit}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <FadeTransition transitionKey={relative.id} style={contentStyles.content}>
          <RootPersonIdentityBanner compact />

          <RelativeProfileHeader
            relative={relative}
            displayName={displayName}
            kinshipLabel={kinshipDisplay.label}
            kinshipMemoryLine={kinshipDisplay.memoryLine}
            kinshipDetail={kinshipDisplay.detail}
            familySummaries={familySummaries}
            uploading={photoUploading}
            onPickPhoto={() => void pickAndUploadPhoto()}
            onRemovePhoto={removePhoto}
          />

          <RelativeProfilePrimaryActions relative={relative} displayName={displayName} />

          <RelativeProfileFamilyRing
            relative={relative}
            relatives={relatives}
            anchorPerson={anchorPerson}
            canEdit={canEdit}
            onOpenRelative={handleOpenRelative}
          />

          <RelativeProfileShezhireSection relative={relative} />

          <RelativeProfileMemoriesSection relative={relative} />

          <CalmDisclosure section="profileMore">
            {familyStory ? <FamilyStorySection story={familyStory} /> : null}
            <EditOwnershipLine entityType="relative" entityId={relative.id} />
            <RelativeProfileNotesSection notes={relative.notes} />
            {relative.isDeceased ? <RelativeProfileMemorialSection relative={relative} /> : null}
          </CalmDisclosure>

          <RelativeProfileFooterActions
            relative={relative}
            deleting={deleting}
            canEdit={canEdit}
            canDelete={canDelete}
            onCongratulations={handleCongratulations}
            onDelete={handleDelete}
          />
        </FadeTransition>
      </ScrollView>

      <RelativeDeleteConfirmModal
        {...deleteModalProps}
        displayName={displayName}
        deleting={deleting}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.cream,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  stateWrap: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 24,
  },
});

function createContentStyles(
  theme: ReturnType<typeof useCalmUx>['theme'],
  calm: ReturnType<typeof useCalmUx>['calm'],
) {
  return StyleSheet.create({
    content: {
      gap: calm.sectionGap,
      maxWidth: theme.maxContentWidth,
      alignSelf: 'center',
      width: '100%',
      paddingTop: theme.spacing.sm,
    },
  });
}
