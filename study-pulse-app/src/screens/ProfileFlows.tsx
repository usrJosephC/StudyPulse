import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Modal, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { changeAppLanguage, type AppLanguage } from '../i18n';
import { deleteCurrentAccount } from '../services/accountDeletion.service';
import { useAuth } from '../contexts/AuthContext';
import { useSquad } from '../hooks/useSquad';
import { useSquadCreation } from '../hooks/useSquadCreation';
import { useTasks } from '../hooks/useTasks';
import { useSquadActivity } from '../hooks/useSquadActivity';
import { supabase } from '../lib/supabase';
import { updateSquad } from '../services/squad.service';
import { Card } from '../components/Card';
import { fonts, radius, spacing } from '../theme';

export type ProfileFlowName = 'account' | 'notifications' | 'squad' | 'preferences';
type ProfileFlowProps = { flow: ProfileFlowName; close: () => void; saved: (name: string) => void; initialName?: string };
export function ProfileFlows(props: ProfileFlowProps) {
  if (props.flow === 'preferences') return <ProfilePreferences close={props.close} />;
  return <ProfileFlowContent {...props} flow={props.flow} />;
}

export function ProfilePreferences({ close }: { close: () => void }) {
  const { t, i18n } = useTranslation();
  const { tema, temaAtual, alternarTema } = useTheme();
  const [legalView, setLegalView] = useState<'terms' | 'privacy' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const language = (i18n.resolvedLanguage ?? i18n.language).toLowerCase().startsWith('en') ? 'en-US' : (i18n.resolvedLanguage ?? i18n.language).toLowerCase().startsWith('es') ? 'es-ES' : 'pt-BR';
  const styles = StyleSheet.create({
    content: { padding: spacing.lg, gap: spacing.md },
    backButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.xs },
    title: { fontFamily: fonts.headlineBold, fontSize: 19, color: temaAtual.ink },
    label: { fontFamily: fonts.bodyBold, fontSize: 14, color: temaAtual.ink },
    text: { fontFamily: fonts.bodyRegular, fontSize: 14, color: temaAtual.inkMuted, lineHeight: 21 },
    option: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, borderWidth: 1, borderColor: temaAtual.border, borderRadius: radius.md, backgroundColor: temaAtual.card },
    optionText: { flex: 1, fontFamily: fonts.bodyMedium, color: temaAtual.ink },
    error: { color: temaAtual.danger, fontFamily: fonts.bodyRegular },
    legalOverlay: { flex: 1, justifyContent: 'center', padding: spacing.lg, backgroundColor: 'rgba(0,0,0,0.45)' },
    legalCard: { padding: spacing.lg, gap: spacing.md, borderRadius: radius.lg, backgroundColor: temaAtual.card },
    button: { minHeight: 48, borderRadius: radius.pill, backgroundColor: temaAtual.secondary, justifyContent: 'center', alignItems: 'center' },
    buttonText: { fontFamily: fonts.bodyBold, color: '#fff' },
  });
  async function changeLanguage(value: AppLanguage) {
    setError(null);
    try { await changeAppLanguage(value); }
    catch { setError(t('language.saveError')); }
  }
  return <ScrollView contentContainerStyle={styles.content}>
    <Pressable onPress={close} style={styles.backButton} accessibilityRole="button" accessibilityLabel={t('common.back')} hitSlop={8}>
      <Ionicons name="arrow-back" size={22} color={temaAtual.ink} />
      <Text style={styles.title}>{t('profile.settings.preferences')}</Text>
    </Pressable>
    {error && <Text style={styles.error} accessibilityRole="alert">{error}</Text>}
    <Text style={styles.label}>{t('theme.label')}</Text>
    <Pressable style={styles.option} onPress={alternarTema} accessibilityRole="button" accessibilityLabel={tema === 'light' ? t('theme.enableDark') : t('theme.enableLight')}>
      <Text style={styles.optionText}>{tema === 'light' ? t('theme.dark') : t('theme.light')}</Text>
      <Ionicons name={tema === 'light' ? 'moon-outline' : 'sunny-outline'} size={20} color={temaAtual.secondary} />
    </Pressable>
    <Text style={styles.label}>{t('language.label')}</Text>
    {(['pt-BR', 'en-US', 'es-ES'] as AppLanguage[]).map(value => {
      const selected = language === value;
      const labelKey = value === 'pt-BR' ? 'language.portuguese' : value === 'en-US' ? 'language.english' : 'language.spanish';
      return <Pressable key={value} style={styles.option} onPress={() => { void changeLanguage(value); }} accessibilityRole="radio" accessibilityLabel={t(labelKey)} accessibilityState={{ selected }}>
        <Text style={styles.optionText}>{t(labelKey)}</Text>
        {selected && <Ionicons name="checkmark-circle" size={20} color={temaAtual.secondary} />}
      </Pressable>;
    })}
    <Pressable style={styles.option} onPress={() => setLegalView('terms')} accessibilityRole="button"><Text style={styles.optionText}>{t('login.termsOfService')}</Text><Ionicons name="chevron-forward" size={18} color={temaAtual.inkFaint} /></Pressable>
    <Pressable style={styles.option} onPress={() => setLegalView('privacy')} accessibilityRole="button"><Text style={styles.optionText}>{t('profile.settings.privacy')}</Text><Ionicons name="chevron-forward" size={18} color={temaAtual.inkFaint} /></Pressable>
    <Modal transparent visible={legalView !== null} animationType="fade" onRequestClose={() => setLegalView(null)}>
      <View style={styles.legalOverlay}><View style={styles.legalCard}>
        <Text style={styles.title}>{legalView === 'terms' ? t('login.termsTitle') : t('profile.settings.privacy')}</Text>
        <Text style={styles.text}>{legalView === 'terms' ? `${t('login.termsContent.paragraph1')}\n\n${t('login.termsContent.paragraph2')}` : t('profile.privacy.content')}</Text>
        <Pressable style={styles.button} onPress={() => setLegalView(null)} accessibilityRole="button" accessibilityLabel={t('common.close')}><Text style={styles.buttonText}>{t('common.close')}</Text></Pressable>
      </View></View>
    </Modal>
  </ScrollView>;
}

function ProfileFlowContent({ flow, close, saved, initialName }: Omit<ProfileFlowProps, 'flow'> & { flow: Exclude<ProfileFlowName, 'preferences'> }) {
  const { t } = useTranslation();
  const { temaAtual } = useTheme();
  const { session, profile } = useAuth();
  const [name, setName] = useState(initialName ?? profile?.name ?? '');
  const [email, setEmail] = useState(session?.user.email ?? '');
  const [birthDate, setBirthDate] = useState(typeof session?.user.user_metadata?.birthDate === 'string' ? session.user.user_metadata.birthDate : '');
  const [gender, setGender] = useState(typeof session?.user.user_metadata?.gender === 'string' ? session.user.user_metadata.gender : '');
  const [success, setSuccess] = useState<string | null>(null);
  const [groupName, setGroupName] = useState('');
  const [groupSubtitle, setGroupSubtitle] = useState('');
  const [editingGroup, setEditingGroup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [finishingSignOut, setFinishingSignOut] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteSucceeded, setDeleteSucceeded] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const squad = useSquad();
  const creation = useSquadCreation();
  const tasks = useTasks();
  const activity = useSquadActivity(squad.squad?.id ?? null);
  const s = StyleSheet.create({ content: { padding: spacing.lg, gap: spacing.md }, backButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.xs }, preferenceOption: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, borderWidth: 1, borderColor: temaAtual.border, borderRadius: radius.md, backgroundColor: temaAtual.card }, preferenceText: { flex: 1, fontFamily: fonts.bodyMedium, color: temaAtual.ink }, dangerButton: { minHeight: 48, borderRadius: radius.pill, borderWidth: 1, borderColor: temaAtual.danger, justifyContent: 'center', alignItems: 'center' }, dangerText: { fontFamily: fonts.bodyBold, color: temaAtual.danger }, deleteOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg, backgroundColor: 'rgba(0,0,0,0.55)' }, deleteDialog: { width: '100%', maxWidth: 440, gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: temaAtual.card }, deleteTitle: { fontFamily: fonts.headlineBold, fontSize: 20, color: temaAtual.ink }, deleteMessage: { fontFamily: fonts.bodyRegular, fontSize: 14, lineHeight: 21, color: temaAtual.inkMuted }, deleteActions: { gap: spacing.sm, marginTop: spacing.xs }, deleteCancel: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1, borderColor: temaAtual.border }, deleteConfirm: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, backgroundColor: temaAtual.danger }, deleteCancelText: { fontFamily: fonts.bodyBold, color: temaAtual.ink }, deleteConfirmText: { fontFamily: fonts.bodyBold, color: '#fff' }, deleteSuccessText: { fontFamily: fonts.bodyRegular, fontSize: 14, lineHeight: 21, color: temaAtual.ink }, title: { fontFamily: fonts.headlineBold, fontSize: 19, color: temaAtual.ink }, text: { fontFamily: fonts.bodyRegular, fontSize: 14, color: temaAtual.inkMuted }, label: { fontFamily: fonts.bodyBold, fontSize: 14, color: temaAtual.ink }, input: { minHeight: 48, borderWidth: 1, borderColor: temaAtual.border, borderRadius: radius.md, paddingHorizontal: spacing.md, color: temaAtual.ink }, button: { minHeight: 48, borderRadius: radius.pill, backgroundColor: temaAtual.secondary, justifyContent: 'center', alignItems: 'center' }, buttonText: { fontFamily: fonts.bodyBold, color: '#fff' }, card: { gap: spacing.md }, error: { color: temaAtual.danger, fontFamily: fonts.bodyRegular } });
  async function deleteAccount() {
    if (deleting) return;
    setDeleting(true);
    setDeleteError(null);
    const result = await deleteCurrentAccount();
    setDeleting(false);
    if (!result.ok) {
      setDeleteError(result.error.message);
      return;
    }
    setDeleteError(null);
    setDeleteSucceeded(true);
  }
  async function finishAccountDeletion() {
    if (finishingSignOut) return;
    setFinishingSignOut(true);
    setDeleteError(null);
    try {
      if (!supabase) throw new Error('Supabase client unavailable');
      const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' });
      if (signOutError) throw signOutError;
      setDeleteConfirmationOpen(false);
      close();
    } catch {
      setDeleteError(t('login.unexpectedError'));
      setFinishingSignOut(false);
    }
  }
  function openDeleteConfirmation() {
    setDeleteError(null);
    setDeleteSucceeded(false);
    setDeleteConfirmationOpen(true);
  }
  function closeDeleteConfirmation() {
    if (deleting || deleteSucceeded || finishingSignOut) return;
    setDeleteConfirmationOpen(false);
    setDeleteError(null);
    setDeleteSucceeded(false);
  }
  async function save() {
    if (!session || !supabase) return;
    if (!name.trim() || name.trim().length > 80) { setError(t('register.longNameMessage')); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError(t('validation.invalidEmail')); return; }
    if (birthDate && (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || Number.isNaN(new Date(`${birthDate}T00:00:00`).getTime()) || new Date(`${birthDate}T00:00:00`) > new Date())) { setError(t('register.birthDateError')); return; }
    setBusy(true); setError(null);
    const next = name.trim();
    try {
      const { error: updateError } = await supabase.from('profiles').update({ name: next }).eq('id', session.user.id);
      if (updateError) throw updateError;
      saved(next);
      const metadataChanged = birthDate !== (session.user.user_metadata?.birthDate ?? '') || gender !== (session.user.user_metadata?.gender ?? '');
      if (metadataChanged) {
        const { error: metadataError } = await supabase.auth.updateUser({ data: { birthDate, gender } });
        if (metadataError) throw metadataError;
      }
      if (email.trim().toLowerCase() !== (session.user.email ?? '').toLowerCase()) {
        const { error: emailError } = await supabase.auth.updateUser({ email: email.trim() });
        if (emailError) throw emailError;
        setSuccess(t('profile.account.emailConfirmation', { defaultValue: 'Check your new email address to confirm the change.' }));
      } else setSuccess(t('profile.account.saved', { defaultValue: 'Profile saved.' }));
    } catch { setError(t('profile.account.saveError', { defaultValue: 'Could not save your profile.' })); }
    setBusy(false);
  }
  async function create() {
    const result = await creation.createSquad(groupName);
    if (result.ok) void squad.refresh();
  }
  async function share() {
    if (!squad.squad) return;
    setBusy(true); setError(null);
    try { await Share.share({ title: t('groups.shareTitle'), message: t('groups.shareMessage', { name: squad.squad.name, code: squad.squad.invite_code }) }); }
    catch { setError(t('groups.shareError')); }
    finally { setBusy(false); }
  }
  async function saveGroup() {
    if (!squad.squad || !session || squad.squad.created_by !== session.user.id) return;
    const nextName = groupName.trim();
    const nextSubtitle = groupSubtitle.trim();
    if (!nextName || nextName.length > 100 || nextSubtitle.length > 160) { setError(t('profile.squad.invalid', { defaultValue: 'Use a name of up to 100 characters and a description of up to 160.' })); return; }
    setBusy(true); setError(null);
    try {
      const result = await updateSquad(squad.squad.id, nextName, nextSubtitle);
      if (!result.ok) setError(result.error.message);
      else { await squad.refresh(); setEditingGroup(false); setSuccess(t('profile.squad.saved', { defaultValue: 'Group updated.' })); }
    } catch { setError(t('profile.squad.saveError', { defaultValue: 'Could not update the group.' })); }
    finally { setBusy(false); }
  }
  return <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
    <Pressable onPress={close} style={s.backButton} accessibilityRole="button" accessibilityLabel={t('common.back')} hitSlop={8}><Ionicons name="arrow-back" size={22} color={temaAtual.ink} /><Text style={s.title}>{t(flow === 'account' ? 'profile.settings.account' : flow === 'notifications' ? 'profile.settings.notifications' : 'profile.settings.studySquad')}</Text></Pressable>
    {flow === 'account' && <><Card style={s.card}>
      <Text style={s.label}>{t('profile.account.name')}</Text><TextInput style={s.input} value={name} onChangeText={setName} maxLength={80} accessibilityLabel={t('profile.account.name')} />
      <Text style={s.label}>{t('profile.account.email')}</Text><TextInput style={s.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} accessibilityLabel={t('profile.account.email')} />
      <Text style={s.label}>{t('register.birthDate')}</Text><TextInput style={s.input} value={birthDate} onChangeText={setBirthDate} placeholder="YYYY-MM-DD" placeholderTextColor={temaAtual.inkMuted} keyboardType="numbers-and-punctuation" maxLength={10} accessibilityLabel={t('register.birthDate')} />
      <Text style={s.label}>{t('register.gender')}</Text><Text style={s.text}>{t('profile.account.genderHint', { defaultValue: 'Select a value' })}</Text>
      {(['F', 'M', 'Other'] as const).map(value => <Pressable key={value} onPress={() => setGender(value)} accessibilityRole="radio" accessibilityState={{ selected: gender === value }} style={[s.input, { justifyContent: 'center', backgroundColor: gender === value ? temaAtual.secondarySoft : temaAtual.card }]}><Text style={s.label}>{t(`register.genderOptions.${value === 'F' ? 'female' : value === 'M' ? 'male' : 'other'}`)}</Text></Pressable>)}
      <Text style={s.label}>{t('profile.account.memberSince')}</Text><Text style={s.text}>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}</Text>
    </Card>{error && <Text style={s.error} accessibilityRole="alert">{error}</Text>}{success && <Text style={s.text} accessibilityRole="alert">{success}</Text>}<Pressable style={s.button} onPress={() => void save()} disabled={busy || !name.trim()} accessibilityRole="button" accessibilityState={{ disabled: busy || !name.trim(), busy }}><Text style={s.buttonText}>{busy ? t('profile.pleaseWait') : t('profile.account.save', { defaultValue: 'Save changes' })}</Text></Pressable></>}
    {flow === 'account' && <>
      <Pressable style={s.dangerButton} onPress={openDeleteConfirmation} accessibilityRole="button" accessibilityLabel={t('profile.account.deleteAction')}><Text style={s.dangerText}>{t('profile.account.deleteAction')}</Text></Pressable>
      <Modal transparent visible={deleteConfirmationOpen} animationType="fade" onRequestClose={closeDeleteConfirmation}>
        <View style={s.deleteOverlay}>
          <View style={s.deleteDialog} accessibilityViewIsModal accessibilityLabel={deleteSucceeded ? t('profile.account.deleteSuccessTitle') : t('profile.account.deleteConfirmTitle')}>
            {deleteSucceeded ? <>
              <Text style={s.deleteTitle} accessibilityRole="header">{t('profile.account.deleteSuccessTitle')}</Text>
              <Text style={s.deleteSuccessText} accessibilityRole="alert">{t('profile.account.deleteSuccess')}</Text>
              {deleteError && <Text style={s.error} accessibilityRole="alert">{deleteError}</Text>}<Pressable style={s.deleteConfirm} onPress={() => { void finishAccountDeletion(); }} disabled={finishingSignOut} accessibilityRole="button" accessibilityLabel={t('login.loginButton')} accessibilityState={{ disabled: finishingSignOut, busy: finishingSignOut }}>{finishingSignOut ? <ActivityIndicator color="#fff" /> : <Text style={s.deleteConfirmText}>{t('login.loginButton')}</Text>}</Pressable>
            </> : <>
              <Text style={s.deleteTitle} accessibilityRole="header">{t('profile.account.deleteConfirmTitle')}</Text>
              <Text style={s.deleteMessage}>{t('profile.account.deleteConfirmMessage')}</Text>
              {deleteError && <Text style={s.error} accessibilityRole="alert">{deleteError}</Text>}
              {deleting && <View accessibilityLiveRegion="polite"><ActivityIndicator color={temaAtual.danger} /><Text style={s.deleteMessage}>{t('profile.pleaseWait')}</Text></View>}
              <View style={s.deleteActions}>
                <Pressable style={s.deleteCancel} onPress={closeDeleteConfirmation} disabled={deleting} accessibilityRole="button" accessibilityLabel={t('common.cancel')} accessibilityState={{ disabled: deleting }}><Text style={s.deleteCancelText}>{t('common.cancel')}</Text></Pressable>
                <Pressable style={s.deleteConfirm} onPress={() => { void deleteAccount(); }} disabled={deleting} accessibilityRole="button" accessibilityLabel={t('profile.account.deleteAction')} accessibilityState={{ disabled: deleting, busy: deleting }}><Text style={s.deleteConfirmText}>{deleting ? t('profile.pleaseWait') : t('profile.account.deleteAction')}</Text></Pressable>
              </View>
            </>}
          </View>
        </View>
      </Modal>
    </>}
    {flow === 'notifications' && <><Text style={s.title}>{t('profile.notifications.today', { defaultValue: 'Today' })}</Text>{(tasks.loading || squad.loading || activity.loading) && <ActivityIndicator color={temaAtual.primary} />}{(tasks.error || squad.error || activity.error) && <Pressable onPress={() => { void tasks.refresh(); void squad.refresh(); void activity.refresh(); }} accessibilityRole="button"><Text style={s.error}>{tasks.error?.message || squad.error?.message || activity.error?.message} · {t('profile.tapToRetry')}</Text></Pressable>}{tasks.tasks.filter(task => !task.done).map(task => <Card key={task.id}><Text style={s.label}>{task.title}</Text><Text style={s.text}>{t('profile.notifications.pending', { defaultValue: 'Task pending today' })}</Text></Card>)}{activity.activities.map(item => <Card key={`activity-${item.id}`}><Text style={s.label}>{item.user_name}</Text><Text style={s.text}>{t('profile.notifications.activity', { defaultValue: 'New study group activity' })}</Text></Card>)}{!tasks.loading && !activity.loading && !tasks.error && !activity.error && tasks.tasks.every(task => task.done) && activity.activities.length === 0 && <Text style={s.text}>{t('profile.notifications.empty', { defaultValue: 'No updates right now.' })}</Text>}</>}
    {flow === 'squad' && <>{squad.loading && <ActivityIndicator color={temaAtual.primary} />}{squad.error && <Pressable onPress={() => void squad.refresh()} accessibilityRole="button"><Text style={s.error}>{squad.error.message} · {t('groups.tapToRetry')}</Text></Pressable>}{!squad.loading && !squad.error && !squad.squad && <Card style={s.card}><Text style={s.title}>{t('groups.createGroup')}</Text><Text style={s.text}>{t('groups.createGroupHint')}</Text><TextInput style={s.input} value={groupName} onChangeText={setGroupName} maxLength={100} placeholder={t('groups.groupNamePlaceholder')} placeholderTextColor={temaAtual.inkMuted} accessibilityLabel={t('groups.groupNamePlaceholder')} />{creation.error && <Text style={s.error}>{creation.error.message}</Text>}<Pressable style={s.button} onPress={() => void create()} disabled={!groupName.trim() || creation.loading} accessibilityRole="button" accessibilityState={{ disabled: !groupName.trim() || creation.loading, busy: creation.loading }}><Text style={s.buttonText}>{creation.loading ? t('profile.pleaseWait') : t('groups.createGroup')}</Text></Pressable></Card>}{squad.squad && <Card style={s.card}><Text style={s.title}>{squad.squad.name}</Text><Text style={s.text}>{squad.squad.subtitle || t('groups.defaultSubtitle')}</Text><Text style={s.label}>{t('groups.yourInviteCode')}</Text><Text style={s.title} selectable>{squad.squad.invite_code}</Text>{error && <Text style={s.error}>{error}</Text>}<Pressable style={s.button} onPress={() => void share()} disabled={busy} accessibilityRole="button" accessibilityState={{ busy }}><Text style={s.buttonText}>{t('groups.shareCode')}</Text></Pressable></Card>}
      {squad.squad && session?.user.id === squad.squad.created_by && <Card style={s.card}>
        <Pressable onPress={() => { if (squad.squad) { setGroupName(squad.squad.name); setGroupSubtitle(squad.squad.subtitle); setEditingGroup(value => !value); setError(null); } }} accessibilityRole="button" accessibilityLabel={t('profile.squad.edit', { defaultValue: 'Edit group' })}><Text style={s.label}>⚙ {t('profile.squad.edit', { defaultValue: 'Edit group' })}</Text></Pressable>
        {editingGroup && <><Text style={s.label}>{t('groups.groupNamePlaceholder')}</Text><TextInput style={s.input} value={groupName} onChangeText={setGroupName} maxLength={100} accessibilityLabel={t('groups.groupNamePlaceholder')} /><Text style={s.label}>{t('profile.squad.description', { defaultValue: 'Description' })}</Text><TextInput style={s.input} value={groupSubtitle} onChangeText={setGroupSubtitle} maxLength={160} accessibilityLabel={t('profile.squad.description', { defaultValue: 'Description' })} />{error && <Text style={s.error} accessibilityRole="alert">{error}</Text>}<Pressable style={s.button} onPress={() => void saveGroup()} disabled={busy || !groupName.trim()} accessibilityRole="button" accessibilityState={{ busy, disabled: busy || !groupName.trim() }}><Text style={s.buttonText}>{busy ? t('profile.pleaseWait') : t('profile.account.save')}</Text></Pressable></>}
        {success && <Text style={s.text} accessibilityRole="alert">{success}</Text>}
      </Card>}</>}
  </ScrollView>;
}
