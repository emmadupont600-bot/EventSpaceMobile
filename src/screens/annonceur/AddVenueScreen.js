/**
 * AddVenueScreen — Publish a new venue.
 *
 * Features
 *  - Cover photo + multi-photo gallery (expo-image-picker → Supabase Storage)
 *  - Section-based form with chips for type / category / amenities
 *  - Inline validation, soft errors, sticky submit CTA
 *  - Toast feedback (replaces native Alert.alert)
 *  - Graceful degradation if expo-image-picker / Storage isn't ready yet
 */
import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  ActivityIndicator, Image, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Store } from '../../utils/store';
import { pickAndUpload } from '../../services/uploadService';
import { useToast } from '../../components/Toast';
import { colors, spacing, typography, radius, shadow } from '../../theme/colors';

const TYPES = ['Loft', 'Salle', 'Studio', 'Rooftop', 'Domaine', 'Bureau', 'Château', 'Jardin', 'Autre'];
const CATEGORIES = ['Soirée', 'Mariage', 'Professionnel', 'Anniversaire', 'Shooting'];
const AMENITIES_LIST = ['WiFi', 'Parking', 'Cuisine', 'Sono', 'Climatisation', 'Terrasse', 'Vidéoprojecteur', 'Catering', 'PMR', 'Piscine'];

export default function AddVenueScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const [name, setName]               = useState('');
  const [city, setCity]               = useState('');
  const [address, setAddress]         = useState('');
  const [price, setPrice]             = useState('');
  const [capacity, setCapacity]       = useState('');
  const [type, setType]               = useState('');
  const [category, setCategory]       = useState('');
  const [description, setDescription] = useState('');
  const [amenities, setAmenities]     = useState([]);
  const [cover, setCover]             = useState(null);
  const [gallery, setGallery]         = useState([]);
  const [coverUploading, setCoverUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [saving, setSaving]           = useState(false);

  const toggleAmenity = useCallback((a) => {
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  }, []);

  const handlePickCover = useCallback(async () => {
    setCoverUploading(true);
    try {
      const url = await pickAndUpload('venues/covers');
      if (url) {
        setCover(url);
        toast.success('Photo de couverture ajoutée');
      }
    } catch (e) {
      toast.error(e.message || 'Erreur upload');
    } finally {
      setCoverUploading(false);
    }
  }, [toast]);

  const handlePickGalleryPhoto = useCallback(async () => {
    setGalleryUploading(true);
    try {
      const url = await pickAndUpload('venues/gallery');
      if (url) {
        setGallery(prev => [...prev, url]);
        toast.success('Photo ajoutée');
      }
    } catch (e) {
      toast.error(e.message || 'Erreur upload');
    } finally {
      setGalleryUploading(false);
    }
  }, [toast]);

  const removeGalleryPhoto = useCallback((idx) => {
    setGallery(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const missing = useMemo(() => {
    const m = [];
    if (!name.trim()) m.push('nom');
    if (!city.trim()) m.push('ville');
    if (!price) m.push('prix');
    if (!capacity) m.push('capacité');
    if (!type) m.push('type');
    if (!category) m.push('catégorie');
    return m;
  }, [name, city, price, capacity, type, category]);

  const handleSubmit = async () => {
    if (missing.length > 0) {
      toast.error(`Manque : ${missing.join(', ')}`);
      return;
    }
    setSaving(true);
    try {
      await Store.addVenue({
        name:        name.trim(),
        city:        city.trim(),
        address:     address.trim(),
        price:       parseInt(price, 10) || 0,
        capacity:    parseInt(capacity, 10) || 0,
        type,
        category,
        description: description.trim(),
        tags:        amenities,
        img:         cover || (gallery[0] ?? null),
        cover_url:   cover || (gallery[0] ?? null),
        gallery,
        gallery_urls: gallery,
        published:   true,
      });
      toast.success(`"${name}" est publié 🎉`);
      navigation.goBack();
    } catch (e) {
      toast.error(e.message || 'Impossible de publier');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* HEADER */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="close" size={22} color={colors.dark} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.headerTitle}>Nouveau lieu</Text>
            <Text style={styles.headerSub}>Présente ton espace au monde</Text>
          </View>
          <View style={{ width: 42 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* COVER */}
          <SectionHeader icon="image-outline" title="Photo de couverture" subtitle="L'image qui donne envie" />
          <TouchableOpacity
            style={styles.coverPickerBox}
            onPress={handlePickCover}
            activeOpacity={0.85}
            disabled={coverUploading}
          >
            {cover ? (
              <>
                <Image source={{ uri: cover }} style={styles.coverImg} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.coverOverlay}
                />
                <View style={styles.coverEditPill}>
                  <Ionicons name="camera" size={14} color="#fff" />
                  <Text style={styles.coverEditText}>Changer</Text>
                </View>
              </>
            ) : coverUploading ? (
              <View style={styles.coverEmpty}>
                <ActivityIndicator color={colors.primary} size="large" />
                <Text style={styles.coverEmptyText}>Envoi…</Text>
              </View>
            ) : (
              <View style={styles.coverEmpty}>
                <View style={styles.coverEmptyIcon}>
                  <Ionicons name="cloud-upload-outline" size={28} color={colors.primary} />
                </View>
                <Text style={styles.coverEmptyText}>Ajouter une photo de couverture</Text>
                <Text style={styles.coverEmptyHint}>JPG / PNG · 16:9 recommandé</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* GALLERY */}
          <SectionHeader
            icon="images-outline"
            title="Galerie de photos"
            subtitle={`${gallery.length} photo${gallery.length > 1 ? 's' : ''}`}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.galleryRow}
          >
            {gallery.map((uri, idx) => (
              <View key={uri + idx} style={styles.galleryItem}>
                <Image source={{ uri }} style={styles.galleryImg} />
                <TouchableOpacity
                  style={styles.galleryRemoveBtn}
                  onPress={() => removeGalleryPhoto(idx)}
                >
                  <Ionicons name="close" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={styles.galleryAdd}
              onPress={handlePickGalleryPhoto}
              disabled={galleryUploading}
              activeOpacity={0.8}
            >
              {galleryUploading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <>
                  <Ionicons name="add" size={26} color={colors.primary} />
                  <Text style={styles.galleryAddText}>Ajouter</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>

          {/* INFOS */}
          <SectionHeader icon="information-circle-outline" title="Informations" />
          <Field label="Nom du lieu" required value={name} onChangeText={setName} placeholder="Ex: Le Loft des Arts" />
          <Row>
            <Field flex label="Ville" required value={city} onChangeText={setCity} placeholder="Paris" />
            <Field
              flex
              label="Prix / heure (€)"
              required
              value={price}
              onChangeText={setPrice}
              placeholder="150"
              keyboardType="number-pad"
              prefix="€"
            />
          </Row>
          <Row>
            <Field flex label="Capacité" required value={capacity} onChangeText={setCapacity} placeholder="100" keyboardType="number-pad" suffix="pers." />
            <View style={{ flex: 1 }} />
          </Row>
          <Field
            label="Adresse complète"
            value={address}
            onChangeText={setAddress}
            placeholder="12 rue de la Paix, 75002 Paris"
          />

          {/* TYPE */}
          <SectionHeader icon="business-outline" title="Type de lieu" required />
          <ChipGrid items={TYPES} value={type} onChange={setType} />

          {/* CATEGORY */}
          <SectionHeader icon="sparkles-outline" title="Catégorie" required />
          <ChipGrid items={CATEGORIES} value={category} onChange={setCategory} />

          {/* AMENITIES */}
          <SectionHeader icon="construct-outline" title="Équipements" />
          <ChipGrid items={AMENITIES_LIST} multi value={amenities} onChange={setAmenities} />

          {/* DESCRIPTION */}
          <SectionHeader icon="document-text-outline" title="Description" />
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Présente ton espace : ambiance, points forts, équipements particuliers…"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            placeholderTextColor={colors.light}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{description.length}/600</Text>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* STICKY SUBMIT */}
        <View style={[styles.submitWrap, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity
            style={[styles.submitBtn, (saving || missing.length > 0) && { opacity: 0.55 }]}
            onPress={handleSubmit}
            disabled={saving || missing.length > 0}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[colors.primary, '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitGradient}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="rocket" size={20} color="#fff" />
                  <Text style={styles.submitText}>
                    {missing.length === 0 ? 'Publier le lieu' : `Encore ${missing.length} champ${missing.length > 1 ? 's' : ''}`}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Subcomponents ─────────────────────────────────────────────────────

function SectionHeader({ icon, title, subtitle, required }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIcon}>
        <Ionicons name={icon} size={16} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>
          {title}{required ? <Text style={{ color: colors.error }}> *</Text> : null}
        </Text>
        {subtitle ? <Text style={styles.sectionSub}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

function Row({ children }) {
  return <View style={styles.row}>{children}</View>;
}

function Field({ label, required, prefix, suffix, flex, ...input }) {
  return (
    <View style={[styles.fieldWrap, flex && { flex: 1 }]}>
      <Text style={styles.fieldLabel}>
        {label}{required ? <Text style={{ color: colors.error }}> *</Text> : null}
      </Text>
      <View style={styles.inputBox}>
        {prefix ? <Text style={styles.affix}>{prefix}</Text> : null}
        <TextInput
          style={styles.fieldInput}
          placeholderTextColor={colors.light}
          {...input}
        />
        {suffix ? <Text style={styles.affix}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

function ChipGrid({ items, value, onChange, multi = false }) {
  const isActive = (it) => multi ? value.includes(it) : value === it;
  const handle = (it) => {
    if (multi) {
      onChange(value.includes(it) ? value.filter(x => x !== it) : [...value, it]);
    } else {
      onChange(value === it ? '' : it);
    }
  };
  return (
    <View style={styles.chipGrid}>
      {items.map(it => {
        const active = isActive(it);
        return (
          <TouchableOpacity
            key={it}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => handle(it)}
            activeOpacity={0.8}
          >
            {active ? (
              <Ionicons name="checkmark" size={13} color="#fff" style={{ marginRight: 4 }} />
            ) : null}
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{it}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  headerBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  iconBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: typography.h2, fontWeight: '800', color: colors.dark },
  headerSub: { fontSize: typography.tiny, color: colors.mid, marginTop: 2 },

  scroll: { padding: spacing.lg, paddingBottom: 40 },

  // Sections
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginTop: spacing.xl, marginBottom: spacing.md,
  },
  sectionIcon: {
    width: 32, height: 32, borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  sectionTitle: { fontSize: typography.h3, fontWeight: '800', color: colors.dark },
  sectionSub: { fontSize: typography.tiny, color: colors.mid, marginTop: 2 },

  // Cover
  coverPickerBox: {
    height: 200, borderRadius: radius.lg, overflow: 'hidden',
    backgroundColor: colors.white,
    borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center',
  },
  coverImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  coverOverlay: { ...StyleSheet.absoluteFillObject },
  coverEditPill: {
    position: 'absolute', bottom: 12, right: 12,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: radius.full,
  },
  coverEditText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  coverEmpty: { alignItems: 'center', justifyContent: 'center', padding: 16 },
  coverEmptyIcon: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  coverEmptyText: { fontSize: typography.body, fontWeight: '700', color: colors.dark },
  coverEmptyHint: { fontSize: typography.tiny, color: colors.mid, marginTop: 4 },

  // Gallery
  galleryRow: { gap: 10, paddingRight: 4, paddingVertical: 4 },
  galleryItem: {
    width: 110, height: 110, borderRadius: radius.md, overflow: 'hidden',
    backgroundColor: colors.white,
  },
  galleryImg: { width: '100%', height: '100%' },
  galleryRemoveBtn: {
    position: 'absolute', top: 6, right: 6,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center', alignItems: 'center',
  },
  galleryAdd: {
    width: 110, height: 110, borderRadius: radius.md,
    borderWidth: 2, borderColor: colors.primary, borderStyle: 'dashed',
    backgroundColor: colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  galleryAddText: { fontSize: 12, fontWeight: '700', color: colors.primary, marginTop: 4 },

  // Form
  row: { flexDirection: 'row', gap: spacing.md },
  fieldWrap: { marginTop: spacing.md },
  fieldLabel: {
    fontSize: typography.small, fontWeight: '700',
    color: colors.dark, marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: 14,
    ...shadow.xs,
  },
  fieldInput: {
    flex: 1, paddingVertical: 14,
    fontSize: typography.body, color: colors.dark,
  },
  affix: { fontSize: typography.body, fontWeight: '700', color: colors.mid, paddingHorizontal: 4 },

  input: {
    backgroundColor: colors.white, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: 14, paddingVertical: 14,
    fontSize: typography.body, color: colors.dark,
    ...shadow.xs,
  },
  textarea: { minHeight: 130 },
  charCount: { fontSize: typography.tiny, color: colors.light, alignSelf: 'flex-end', marginTop: 4 },

  // Chips
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: radius.full,
    borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.dark },
  chipTextActive: { color: '#fff' },

  // Submit
  submitWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1, borderTopColor: colors.borderLight,
  },
  submitBtn: { borderRadius: radius.lg, overflow: 'hidden', ...shadow.md },
  submitGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 17,
  },
  submitText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});
