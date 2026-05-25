import type { FamilyBackupBundle, BackupValidationResult } from '@/types/family-backup';
import { FAMILY_BACKUP_VERSION } from '@/types/family-backup';
import type { CreateRelativeInput, Relative } from '@/types/relative';
import type { TimelineEvent } from '@/types/timeline';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { escapeHtml } from '@/utils/family-backup-html';

export function relativeToCreateInput(relative: Relative): CreateRelativeInput {
  return {
    fullName: relative.fullName,
    firstName: relative.firstName,
    middleName: relative.middleName,
    birthSurname: relative.birthSurname,
    currentSurname: relative.currentSurname,
    displayName: relative.displayName,
    relationship: relative.relationship,
    birthday: relative.birthday,
    birthdayDay: relative.birthdayDay,
    birthdayMonth: relative.birthdayMonth,
    birthdayYear: relative.birthdayYear,
    birthdayYearUnknown: relative.birthdayYearUnknown,
    phone: relative.phone,
    avatarColor: relative.avatarColor,
    photoUrl: relative.photoUrl,
    isDeceased: relative.isDeceased,
    deathYear: relative.deathYear,
    duaText: relative.duaText,
    notes: relative.notes,
    fatherId: relative.fatherId ?? null,
    motherId: relative.motherId ?? null,
    spouseId: relative.spouseId ?? null,
    gender: relative.gender,
    maritalStatus: relative.maritalStatus,
    zhuz: relative.zhuz,
    ru: relative.ru,
    ataLine: relative.ataLine,
    tribeBranch: relative.tribeBranch,
  };
}

export function validateFamilyBackup(raw: unknown): BackupValidationResult {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, error: 'Файл форматы дұрыс емес' };
  }

  const candidate = raw as Partial<FamilyBackupBundle>;

  if (candidate.version !== FAMILY_BACKUP_VERSION) {
    return { ok: false, error: 'Бұл сақтық көшірме нұсқасы қолдау көрсетілмейді' };
  }

  if (!candidate.familyId || typeof candidate.familyId !== 'string') {
    return { ok: false, error: 'Отбасы идентификаторы табылмады' };
  }

  if (!Array.isArray(candidate.relatives)) {
    return { ok: false, error: 'Туыстар тізімі жоқ' };
  }

  if (!Array.isArray(candidate.memories)) {
    return { ok: false, error: 'Естеліктер тізімі жоқ' };
  }

  return {
    ok: true,
    bundle: {
      version: FAMILY_BACKUP_VERSION,
      exportedAt: candidate.exportedAt ?? new Date().toISOString(),
      familyId: candidate.familyId,
      familyName: candidate.familyName ?? 'Отбасы',
      family: candidate.family ?? null,
      members: Array.isArray(candidate.members) ? candidate.members : [],
      relatives: candidate.relatives,
      memories: candidate.memories,
      timeline: Array.isArray(candidate.timeline) ? candidate.timeline : [],
      assets: candidate.assets,
    },
  };
}

export function buildBackupFileName(familyName: string, exportedAt: string): string {
  const safeName = familyName
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .slice(0, 32) || 'otbasy';
  const stamp = exportedAt.slice(0, 10);
  return `shanyraq-${safeName}-${stamp}.json`;
}

function formatRelativeLine(relative: Relative): string {
  const parts = [
    getRelativeDisplayName(relative),
    relative.relationship,
    relative.birthday ? `туған: ${relative.birthday}` : null,
    relative.isDeceased ? 'марқұм' : null,
    relative.ru ? `ру: ${relative.ru}` : null,
  ].filter(Boolean);

  return parts.join(' · ');
}

function formatTimelineLine(event: TimelineEvent): string {
  const dateParts = [event.day, event.month, event.year].filter(Boolean).join('.');
  return `${dateParts ? `${dateParts} — ` : ''}${event.title}`;
}

export function buildFamilyBackupPdfHtml(bundle: FamilyBackupBundle): string {
  const exportedDate = new Date(bundle.exportedAt).toLocaleDateString('kk-KZ');
  const relatives = [...bundle.relatives].sort((a, b) =>
    getRelativeDisplayName(a).localeCompare(getRelativeDisplayName(b), 'kk'),
  );
  const timeline = [...bundle.timeline].slice(0, 40);

  const relativeRows = relatives
    .map(
      (relative) => `
        <tr>
          <td>${escapeHtml(getRelativeDisplayName(relative))}</td>
          <td>${escapeHtml(relative.relationship)}</td>
          <td>${escapeHtml(relative.birthday || '—')}</td>
          <td>${relative.isDeceased ? 'Марқұм' : 'Тірі'}</td>
        </tr>`,
    )
    .join('');

  const memoryItems = bundle.memories
    .slice(0, 24)
    .map(
      (memory) => `
        <div class="memory">
          <strong>${escapeHtml(memory.title)}</strong>
          <span>${escapeHtml(memory.relativeName)} · ${escapeHtml(memory.year)}</span>
          ${memory.story ? `<p>${escapeHtml(memory.story)}</p>` : ''}
        </div>`,
    )
    .join('');

  const timelineItems = timeline
    .map((event) => `<li>${escapeHtml(formatTimelineLine(event))}</li>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="kk">
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Georgia, serif; color: #1B4332; padding: 32px; background: #FAF7F0; }
    h1 { color: #1B4332; margin-bottom: 4px; }
    .meta { color: #5C6B64; margin-bottom: 24px; }
    .summary { background: #fff; border: 1px solid #D4AF37; border-radius: 12px; padding: 16px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; }
    th, td { padding: 10px 12px; border-bottom: 1px solid #E8E0D0; text-align: left; font-size: 13px; }
    th { background: #2C4A3E; color: #FAF7F0; }
    h2 { margin-top: 28px; color: #1B4332; }
    .memory { background: #fff; border-left: 4px solid #D4AF37; padding: 12px 14px; margin-bottom: 10px; border-radius: 8px; }
    .memory span { display: block; color: #5C6B64; font-size: 12px; margin-top: 4px; }
    .memory p { margin: 8px 0 0; line-height: 1.5; font-size: 13px; }
    ul { padding-left: 18px; }
    li { margin-bottom: 6px; line-height: 1.4; }
    .footer { margin-top: 32px; color: #5C6B64; font-size: 12px; }
  </style>
</head>
<body>
  <h1>${escapeHtml(bundle.familyName)}</h1>
  <div class="meta">Shanyraq Family · ${escapeHtml(exportedDate)}</div>

  <div class="summary">
    <strong>Шежіре сақтық көшірмесі</strong><br />
    ${relatives.length} туыс · ${bundle.memories.length} естелік · ${bundle.timeline.length} хронология саты
  </div>

  <h2>Туыстар</h2>
  <table>
    <thead>
      <tr><th>Аты</th><th>Туыстық</th><th>Туған күні</th><th>Күйі</th></tr>
    </thead>
    <tbody>${relativeRows}</tbody>
  </table>

  ${memoryItems ? `<h2>Естеліктер</h2>${memoryItems}` : ''}
  ${timelineItems ? `<h2>Хронология</h2><ul>${timelineItems}</ul>` : ''}

  <div class="footer">
    Бұл құжат отбасы шежіресінің қысқаша көшірмесі. Толық деректер JSON форматында сақталады.
  </div>
</body>
</html>`;
}

export function summarizeBackupBundle(bundle: FamilyBackupBundle) {
  return {
    relativeCount: bundle.relatives.length,
    memoryCount: bundle.memories.length,
    timelineCount: bundle.timeline.length,
    exportedAt: bundle.exportedAt,
  };
}

export function formatBackupDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('kk-KZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function formatRelativeSummaryLine(relative: Relative): string {
  return formatRelativeLine(relative);
}
