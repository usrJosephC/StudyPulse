import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Share, StyleSheet, Text, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useSquad } from '../hooks/useSquad';
import { useSquadCreation } from '../hooks/useSquadCreation';
import { useTasks } from '../hooks/useTasks';
import { useSquadActivity } from '../hooks/useSquadActivity';
import { supabase } from '../lib/supabase';
import { updateSquad } from '../services/squad.service';
import { Card } from '../components/Card';
import { fonts, radius, spacing } from '../theme';

export type ProfileFlowName = 'account' | 'notifications' | 'squad';
export function ProfileFlows({ flow, close, saved, initialName }: { flow: ProfileFlowName; close: () => void; saved: (name: string) => void; initialName?: string }) {
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
  const squad = useSquad();
  const creation = useSquadCreation();
  const tasks = useTasks();
  const activity = useSquadActivity(squad.squad?.id ?? null);
  const s = StyleSheet.create({ content: { padding: spacing.lg, gap: spacing.md }, title: { fontFamily: fonts.headlineBold, fontSize: 19, color: temaAtual.ink }, text: { fontFamily: fonts.bodyRegular, fontSize: 14, color: temaAtual.inkMuted }, label: { fontFamily: fonts.bodyBold, fontSize: 14, color: temaAtual.ink }, input: { minHeight: 48, borderWidth: 1, borderColor: temaAtual.border, borderRadius: radius.md, paddingHorizontal: spacing.md, color: temaAtual.ink }, button: { minHeight: 48, borderRadius: radius.pill, backgroundColor: temaAtual.secondary, justifyContent: 'center', alignItems: 'center' }, buttonText: { fontFamily: fonts.bodyBold, color: '#fff' }, card: { gap: spacing.md }, error: { color: temaAtual.danger, fontFamily: fonts.bodyRegular } });
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
    <Pressable onPress={close} accessibilityRole="button" accessibilityLabel={t('common.close')}><Text style={s.title}>← {t(flow === 'account' ? 'profile.settings.account' : flow === 'notifications' ? 'profile.settings.notifications' : 'profile.settings.studySquad')}</Text></Pressable>
    {flow === 'account' && <><Card style={s.card}>
      <Text style={s.label}>{t('profile.account.name')}</Text><TextInput style={s.input} value={name} onChangeText={setName} maxLength={80} accessibilityLabel={t('profile.account.name')} />
      <Text style={s.label}>{t('profile.account.email')}</Text><TextInput style={s.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} accessibilityLabel={t('profile.account.email')} />
      <Text style={s.label}>{t('register.birthDate')}</Text><TextInput style={s.input} value={birthDate} onChangeText={setBirthDate} placeholder="YYYY-MM-DD" placeholderTextColor={temaAtual.inkMuted} keyboardType="numbers-and-punctuation" maxLength={10} accessibilityLabel={t('register.birthDate')} />
      <Text style={s.label}>{t('register.gender')}</Text><Text style={s.text}>{t('profile.account.genderHint', { defaultValue: 'Select a value' })}</Text>
      {(['F', 'M', 'Other'] as const).map(value => <Pressable key={value} onPress={() => setGender(value)} accessibilityRole="radio" accessibilityState={{ selected: gender === value }} style={[s.input, { justifyContent: 'center', backgroundColor: gender === value ? temaAtual.secondarySoft : temaAtual.card }]}><Text style={s.label}>{t(`register.genderOptions.${value === 'F' ? 'female' : value === 'M' ? 'male' : 'other'}`)}</Text></Pressable>)}
      <Text style={s.label}>{t('profile.account.memberSince')}</Text><Text style={s.text}>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}</Text>
    </Card>{error && <Text style={s.error} accessibilityRole="alert">{error}</Text>}{success && <Text style={s.text} accessibilityRole="alert">{success}</Text>}<Pressable style={s.button} onPress={() => void save()} disabled={busy || !name.trim()} accessibilityRole="button" accessibilityState={{ disabled: busy || !name.trim(), busy }}><Text style={s.buttonText}>{busy ? t('profile.pleaseWait') : t('profile.account.save', { defaultValue: 'Save changes' })}</Text></Pressable></>}
    {flow === 'notifications' && <><Text style={s.title}>{t('profile.notifications.today', { defaultValue: 'Today' })}</Text>{(tasks.loading || squad.loading || activity.loading) && <ActivityIndicator color={temaAtual.primary} />}{(tasks.error || squad.error || activity.error) && <Pressable onPress={() => { void tasks.refresh(); void squad.refresh(); void activity.refresh(); }} accessibilityRole="button"><Text style={s.error}>{tasks.error?.message || squad.error?.message || activity.error?.message} · {t('profile.tapToRetry')}</Text></Pressable>}{tasks.tasks.filter(task => !task.done).map(task => <Card key={task.id}><Text style={s.label}>{task.title}</Text><Text style={s.text}>{t('profile.notifications.pending', { defaultValue: 'Task pending today' })}</Text></Card>)}{activity.activities.map(item => <Card key={`activity-${item.id}`}><Text style={s.label}>{item.user_name}</Text><Text style={s.text}>{t('profile.notifications.activity', { defaultValue: 'New study group activity' })}</Text></Card>)}{!tasks.loading && !activity.loading && !tasks.error && !activity.error && tasks.tasks.every(task => task.done) && activity.activities.length === 0 && <Text style={s.text}>{t('profile.notifications.empty', { defaultValue: 'No updates right now.' })}</Text>}</>}
    {flow === 'squad' && <>{squad.loading && <ActivityIndicator color={temaAtual.primary} />}{squad.error && <Pressable onPress={() => void squad.refresh()} accessibilityRole="button"><Text style={s.error}>{squad.error.message} · {t('groups.tapToRetry')}</Text></Pressable>}{!squad.loading && !squad.error && !squad.squad && <Card style={s.card}><Text style={s.title}>{t('groups.createGroup')}</Text><Text style={s.text}>{t('groups.createGroupHint')}</Text><TextInput style={s.input} value={groupName} onChangeText={setGroupName} maxLength={100} placeholder={t('groups.groupNamePlaceholder')} placeholderTextColor={temaAtual.inkMuted} accessibilityLabel={t('groups.groupNamePlaceholder')} />{creation.error && <Text style={s.error}>{creation.error.message}</Text>}<Pressable style={s.button} onPress={() => void create()} disabled={!groupName.trim() || creation.loading} accessibilityRole="button" accessibilityState={{ disabled: !groupName.trim() || creation.loading, busy: creation.loading }}><Text style={s.buttonText}>{creation.loading ? t('profile.pleaseWait') : t('groups.createGroup')}</Text></Pressable></Card>}{squad.squad && <Card style={s.card}><Text style={s.title}>{squad.squad.name}</Text><Text style={s.text}>{squad.squad.subtitle || t('groups.defaultSubtitle')}</Text><Text style={s.label}>{t('groups.yourInviteCode')}</Text><Text style={s.title} selectable>{squad.squad.invite_code}</Text>{error && <Text style={s.error}>{error}</Text>}<Pressable style={s.button} onPress={() => void share()} disabled={busy} accessibilityRole="button" accessibilityState={{ busy }}><Text style={s.buttonText}>{t('groups.shareCode')}</Text></Pressable></Card>}
      {squad.squad && session?.user.id === squad.squad.created_by && <Card style={s.card}>
        <Pressable onPress={() => { if (squad.squad) { setGroupName(squad.squad.name); setGroupSubtitle(squad.squad.subtitle); setEditingGroup(value => !value); setError(null); } }} accessibilityRole="button" accessibilityLabel={t('profile.squad.edit', { defaultValue: 'Edit group' })}><Text style={s.label}>⚙ {t('profile.squad.edit', { defaultValue: 'Edit group' })}</Text></Pressable>
        {editingGroup && <><Text style={s.label}>{t('groups.groupNamePlaceholder')}</Text><TextInput style={s.input} value={groupName} onChangeText={setGroupName} maxLength={100} accessibilityLabel={t('groups.groupNamePlaceholder')} /><Text style={s.label}>{t('profile.squad.description', { defaultValue: 'Description' })}</Text><TextInput style={s.input} value={groupSubtitle} onChangeText={setGroupSubtitle} maxLength={160} accessibilityLabel={t('profile.squad.description', { defaultValue: 'Description' })} />{error && <Text style={s.error} accessibilityRole="alert">{error}</Text>}<Pressable style={s.button} onPress={() => void saveGroup()} disabled={busy || !groupName.trim()} accessibilityRole="button" accessibilityState={{ busy, disabled: busy || !groupName.trim() }}><Text style={s.buttonText}>{busy ? t('profile.pleaseWait') : t('profile.account.save')}</Text></Pressable></>}
        {success && <Text style={s.text} accessibilityRole="alert">{success}</Text>}
      </Card>}</>}
  </ScrollView>;
}
