'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth, INITIAL_STAFF_ACCOUNTS } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { INITIAL_PROPERTIES, INITIAL_ARTICLES } from '@/data/properties';
import {
  Property,
  Lead,
  BookingRequest,
  BlogPost,
  UserAccount,
  UserRole,
  UniverseType,
  PropertyCategory,
  PropertyStatus,
} from '@/types';
import {
  Building2,
  Users,
  Calendar,
  TrendingUp,
  Plus,
  Search,
  Eye,
  EyeOff,
  AlertCircle,
  Edit,
  Trash2,
  Lock,
  Sparkles,
  UserCheck,
  Copy,
  MessageCircle,
  X,
  Key,
  LogOut,
  ArrowRight,
  ShieldCheck,
  FileText,
  Mail,
  Phone,
  ExternalLink,
  Star,
  UserPlus,
  CheckCircle,
  Filter,
  Check,
  UploadCloud,
  FileCheck,
} from 'lucide-react';

export interface OwnerSubmission {
  id: string;
  refCode: string;
  propertyType: PropertyCategory;
  objective: UniverseType;
  gouvernorat?: string;
  city: string;
  district: string;
  address?: string;
  googleMapsLink?: string;
  surfaceM2: number;
  bedrooms?: number;
  estimatedPrice: number;
  estimatedValue?: number;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  titleType?: string;
  titleNumber?: string;
  hasCertificate?: string;
  hasBuildingPermit?: string;
  tunisianLawCertified?: boolean;
  specificDetails?: Record<string, any>;
  details?: string;
  photos?: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOUVEAU' | 'CONTACTE' | 'VISITE' | 'MANDAT_SIGNE';
  createdAt: string;
}

const INITIAL_SUBMISSIONS: OwnerSubmission[] = [];

const INITIAL_RESERVATIONS: BookingRequest[] = [];

const INITIAL_LEADS: Lead[] = [];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, is2FAVerified, logout, hasPermission, logAction, auditLogs } = useAuth();
  const { language } = useLanguage();

  // Active Tab State
  const [activeTab, setActiveTab] = useState<'kpi' | 'properties' | 'submissions' | 'crm' | 'reservations' | 'articles' | 'users' | 'audit'>('kpi');

  // Functional Data States
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [submissions, setSubmissions] = useState<OwnerSubmission[]>(INITIAL_SUBMISSIONS);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [reservations, setReservations] = useState<BookingRequest[]>(INITIAL_RESERVATIONS);
  const [articles, setArticles] = useState<BlogPost[]>(INITIAL_ARTICLES);
  const [staffUsers, setStaffUsers] = useState<UserAccount[]>(INITIAL_STAFF_ACCOUNTS);
  const [dbStats, setDbStats] = useState<any>(null);

  // Sync data from live APIs & LocalStorage
  useEffect(() => {
    async function loadAdminData() {
      try {
        const [statsRes, propsRes, bookingsRes, crmRes, usersRes, subsRes] = await Promise.all([
          fetch('/api/admin/stats').then(r => r.json()).catch(() => null),
          fetch('/api/properties').then(r => r.json()).catch(() => null),
          fetch('/api/bookings').then(r => r.json()).catch(() => null),
          fetch('/api/admin/crm').then(r => r.json()).catch(() => null),
          fetch('/api/admin/users').then(r => r.json()).catch(() => null),
          fetch('/api/submissions').then(r => r.json()).catch(() => null),
        ]);

        if (statsRes?.success) setDbStats(statsRes.stats);
        if (propsRes?.success && Array.isArray(propsRes.properties)) setProperties(propsRes.properties);
        if (bookingsRes?.success && Array.isArray(bookingsRes.bookings)) setReservations(bookingsRes.bookings);
        if (crmRes?.success && Array.isArray(crmRes.leads)) setLeads(crmRes.leads);
        if (usersRes?.success && Array.isArray(usersRes.users)) {
          if (usersRes.users.length > 0) setStaffUsers(usersRes.users);
        }
        if (subsRes?.success && Array.isArray(subsRes.submissions)) {
          setSubmissions(subsRes.submissions);
        }
      } catch (err) {
        console.warn('Admin API load fallback:', err);
      }
    }
    loadAdminData();
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('vr_owner_submissions');
      if (stored) {
        const parsed: OwnerSubmission[] = JSON.parse(stored);
        if (parsed.length > 0) {
          setSubmissions((prev) => {
            const ids = new Set(prev.map((s) => s.id || s.refCode));
            const fresh = parsed.filter((s) => !ids.has(s.id) && !ids.has(s.refCode));
            return [...fresh, ...prev];
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const [inspectingSubmission, setInspectingSubmission] = useState<OwnerSubmission | null>(null);

  // Status Handlers with API Sync
  const handleUpdatePropertyStatus = async (propId: string, newStatus: PropertyStatus) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === propId ? { ...p, status: newStatus } : p))
    );
    try {
      await fetch(`/api/properties/${propId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.warn('Property status update API fallback:', e);
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, newStatus: Lead['status']) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
    try {
      await fetch('/api/admin/crm', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, status: newStatus }),
      });
    } catch (e) {
      console.warn('Lead status update API fallback:', e);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED') => {
    setReservations((prev) =>
      prev.map((r) => (r.id === bookingId ? { ...r, status: newStatus } : r))
    );
    try {
      await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.warn('Booking status update API fallback:', e);
    }
  };

  // Search & Filter States
  const [propertySearch, setPropertySearch] = useState('');
  const [universeFilter, setUniverseFilter] = useState<string>('ALL');

  // Modal States
  const [propertyModalOpen, setPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [leadNoteInput, setLeadNoteInput] = useState('');
  const [leadStatusInput, setLeadStatusInput] = useState<Lead['status']>('Nouveau');
  const [leadAgentInput, setLeadAgentInput] = useState('');

  const [newLeadModalOpen, setNewLeadModalOpen] = useState(false);
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadUniverse, setNewLeadUniverse] = useState<UniverseType>('VENTE');
  const [newLeadPropTitle, setNewLeadPropTitle] = useState('');

  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<BlogPost | null>(null);
  const [artTitle, setArtTitle] = useState('');
  const [artCategory, setArtCategory] = useState<BlogPost['category']>('Architecture');
  const [artExcerpt, setArtExcerpt] = useState('');
  const [artContent, setArtContent] = useState('');
  const [artReadTime, setArtReadTime] = useState('4 min');
  const [artCoverImage, setArtCoverImage] = useState('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80');

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('AGENT');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [userModalError, setUserModalError] = useState<string | null>(null);
  const [accountRoleFilter, setAccountRoleFilter] = useState<'ALL' | 'STAFF' | 'CLIENT'>('ALL');
  const [accountSearchQuery, setAccountSearchQuery] = useState('');

  // Property Form State
  const [propTitle, setPropTitle] = useState('');
  const [propUniverse, setPropUniverse] = useState<UniverseType>('VENTE');
  const [propCategory, setPropCategory] = useState<PropertyCategory>('Villa');
  const [propPrice, setPropPrice] = useState(1500000);
  const [propSurface, setPropSurface] = useState(450);
  const [propBedrooms, setPropBedrooms] = useState(4);
  const [propCity, setPropCity] = useState('Sfax');
  const [propDistrict, setPropDistrict] = useState('Route de la Soukra');
  const [propImageUrl, setPropImageUrl] = useState('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85');
  const [propDesc, setPropDesc] = useState('');

  // --------------------------------------------------------------------------
  // OWNER SUBMISSION APPROVAL & CONVERSION
  // --------------------------------------------------------------------------
  const handleApproveSubmission = async (sub: OwnerSubmission) => {
    const imagesList = sub.photos && sub.photos.length > 0
      ? sub.photos.map((url, idx) => ({ url, alt: `${sub.propertyType} Photo ${idx + 1}`, isCover: idx === 0 }))
      : [{ url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85', alt: sub.propertyType, isCover: true }];

    const newProp: Property = {
      id: `vr-prop-${Date.now()}`,
      title: { fr: `${sub.propertyType} High Standing — ${sub.district}`, ar: `${sub.propertyType} — ${sub.district}`, en: `${sub.propertyType} — ${sub.district}` },
      universe: sub.objective,
      category: sub.propertyType,
      price: { amount: sub.estimatedPrice || sub.estimatedValue || 0, currency: 'TND', period: 'total' },
      location: { city: sub.city, district: sub.district, country: 'Tunisie', lat: 34.7400, lng: 10.7400, isExactPosition: false },
      specs: { surfaceM2: sub.surfaceM2, bedrooms: sub.bedrooms || 0, pool: true, garden: true },
      images: imagesList,
      description: { fr: sub.details || 'Prestigieuse demeure soumise par son propriétaire et vérifiée par l’équipe Villa Regia.', ar: sub.details || '', en: sub.details || '' },
      amenities: ['Climatisation centralisée', sub.titleType || 'Titre foncier individuel', 'Parking sécurisé', 'Marbre noble'],
      status: 'DISPONIBLE',
      isFeatured: true,
      isNew: true,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setProperties((prev) => [newProp, ...prev]);
    setSubmissions((prev) => prev.map((s) => (s.id === sub.id ? { ...s, status: 'APPROVED' } : s)));
    if (inspectingSubmission?.id === sub.id) {
      setInspectingSubmission({ ...sub, status: 'APPROVED' });
    }

    try {
      await fetch('/api/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sub.id, status: 'APPROVED' }),
      });
      await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProp),
      });
    } catch (e) {
      console.warn('Submission approval API sync fallback:', e);
    }

    logAction('Approbation dossier propriétaire', sub.refCode);
    setActiveTab('properties');
  };

  const handleRejectSubmission = async (subId: string, refCode: string) => {
    setSubmissions((prev) => prev.map((s) => (s.id === subId ? { ...s, status: 'REJECTED' } : s)));
    if (inspectingSubmission?.id === subId) {
      setInspectingSubmission((prev) => prev ? { ...prev, status: 'REJECTED' } : null);
    }
    try {
      await fetch('/api/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: subId, status: 'REJECTED' }),
      });
    } catch (e) {
      console.warn('Submission reject API sync fallback:', e);
    }
    logAction('Refus dossier propriétaire', refCode);
  };

  // --------------------------------------------------------------------------
  // PROPERTY CRUD FUNCTIONS
  // --------------------------------------------------------------------------
  const openAddPropertyModal = () => {
    setEditingProperty(null);
    setPropTitle('');
    setPropUniverse('VENTE');
    setPropCategory('Villa');
    setPropPrice(1500000);
    setPropSurface(450);
    setPropBedrooms(4);
    setPropCity('Sfax');
    setPropDistrict('Route de la Soukra');
    setPropImageUrl('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85');
    setPropDesc('Spacieuse demeure contemporaine avec prestations haut de gamme à Sfax.');
    setPropertyModalOpen(true);
  };

  const openEditPropertyModal = (p: Property) => {
    setEditingProperty(p);
    setPropTitle(p.title.fr);
    setPropUniverse(p.universe);
    setPropCategory(p.category);
    setPropPrice(p.price.amount);
    setPropSurface(p.specs.surfaceM2);
    setPropBedrooms(p.specs.bedrooms || 4);
    setPropCity(p.location.city);
    setPropDistrict(p.location.district);
    setPropImageUrl(p.images[0]?.url || '');
    setPropDesc(p.description.fr);
    setPropertyModalOpen(true);
  };

  const handleSaveProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('properties.update') && !hasPermission('properties.create')) {
      alert('Permission refusée');
      return;
    }

    if (editingProperty) {
      setProperties((prev) =>
        prev.map((item) =>
          item.id === editingProperty.id
            ? {
                ...item,
                title: { fr: propTitle, ar: propTitle, en: propTitle },
                universe: propUniverse,
                category: propCategory,
                price: { ...item.price, amount: Number(propPrice) },
                location: { ...item.location, city: propCity, district: propDistrict },
                specs: { ...item.specs, surfaceM2: Number(propSurface), bedrooms: Number(propBedrooms) },
                description: { fr: propDesc, ar: propDesc, en: propDesc },
                images: [{ url: propImageUrl, alt: propTitle, isCover: true }],
                updatedAt: new Date().toISOString().split('T')[0],
              }
            : item
        )
      );
      logAction('Modification propriété', propTitle);
    } else {
      const newProp: Property = {
        id: `vr-prop-${Date.now()}`,
        title: { fr: propTitle || 'Nouvelle Propriété Sfax', ar: propTitle, en: propTitle },
        universe: propUniverse,
        category: propCategory,
        price: { amount: Number(propPrice), currency: 'TND', period: propUniverse === 'LUXE' ? 'nuit' : 'total' },
        location: { city: propCity, district: propDistrict, country: 'Tunisie', lat: 34.7400, lng: 10.7400, isExactPosition: false },
        specs: { surfaceM2: Number(propSurface), bedrooms: Number(propBedrooms), pool: true, garden: true },
        images: [{ url: propImageUrl, alt: propTitle, isCover: true }],
        description: { fr: propDesc, ar: propDesc, en: propDesc },
        amenities: ['Climatisation centralisée', 'Piscine privée', 'Parking sécurisé', 'Marbre noble'],
        status: 'DISPONIBLE',
        isFeatured: true,
        isNew: true,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      setProperties((prev) => [newProp, ...prev]);
      logAction('Création nouvelle propriété', propTitle);
    }

    setPropertyModalOpen(false);
  };

  const handleDeleteProperty = (id: string, title: string) => {
    if (!hasPermission('properties.delete')) {
      alert('Permission refusée');
      return;
    }
    if (confirm(`Êtes-vous sûr de vouloir supprimer définitivement la propriété "${title}" ?`)) {
      setProperties((prev) => prev.filter((p) => p.id !== id));
      logAction('Suppression propriété', title);
    }
  };

  const handleToggleStatus = (id: string, currentStatus: PropertyStatus, title: string) => {
    if (!hasPermission('properties.publish')) {
      alert('Permission refusée');
      return;
    }
    const nextStatus: PropertyStatus = currentStatus === 'DISPONIBLE' ? 'RÉSERVÉ' : 'DISPONIBLE';
    setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p)));
    logAction(`Statut modifié (${nextStatus})`, title);
  };

  const handleToggleFeatured = (id: string, isFeatured: boolean, title: string) => {
    setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, isFeatured: !isFeatured } : p)));
    logAction(`Mis en Une (${!isFeatured})`, title);
  };

  const handleDuplicateProperty = (p: Property) => {
    const dup: Property = {
      ...p,
      id: `vr-prop-dup-${Date.now()}`,
      title: { fr: `${p.title.fr} (Copie)`, ar: p.title.ar, en: p.title.en },
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProperties((prev) => [dup, ...prev]);
    logAction('Duplication propriété', p.title.fr);
  };

  const handleCreateLeadFromProperty = (p: Property) => {
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: 'Client Inconnu',
      phone: '+216 -- --- ---',
      email: 'client@villaregia.tn',
      source: 'Formulaire Contact',
      universe: p.universe,
      propertyTitle: p.title.fr,
      status: 'Nouveau',
      assignedAgent: user?.name || 'Agent Villa Regia',
      notes: `Lead initié depuis la fiche administrative du bien ${p.title.fr}.`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setLeads((prev) => [newLead, ...prev]);
    logAction('Création Lead depuis Bien', p.title.fr);
    setActiveTab('crm');
  };

  // --------------------------------------------------------------------------
  // CRM LEAD FUNCTIONS
  // --------------------------------------------------------------------------
  const openLeadModal = (lead: Lead) => {
    setActiveLead(lead);
    setLeadNoteInput(lead.notes || '');
    setLeadStatusInput(lead.status);
    setLeadAgentInput(lead.assignedAgent || user?.name || 'Agent Villa Regia');
    setLeadModalOpen(true);
  };

  const handleSaveLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead) return;

    setLeads((prev) =>
      prev.map((l) =>
        l.id === activeLead.id
          ? {
              ...l,
              status: leadStatusInput,
              notes: leadNoteInput,
              assignedAgent: leadAgentInput,
            }
          : l
      )
    );
    logAction(`Mise à jour Lead (${leadStatusInput})`, activeLead.name);
    setLeadModalOpen(false);
  };

  const handleCreateNewLead = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Lead = {
      id: `lead-${Date.now()}`,
      name: newLeadName || 'Nouveau Client',
      phone: newLeadPhone || '+216 98 000 000',
      email: newLeadEmail || 'client@villaregia.tn',
      source: 'Formulaire Contact',
      universe: newLeadUniverse,
      propertyTitle: newLeadPropTitle || 'Demande Générale',
      status: 'Nouveau',
      assignedAgent: user?.name || 'Agent Villa Regia',
      notes: 'Lead ajouté par le conseiller staff.',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setLeads((prev) => [created, ...prev]);
    logAction('Nouveau Lead CRM créé', created.name);
    setNewLeadModalOpen(false);
    setNewLeadName('');
    setNewLeadPhone('');
    setNewLeadEmail('');
    setNewLeadPropTitle('');
  };

  const handleDeleteLead = (id: string, name: string) => {
    if (confirm(`Supprimer le lead commercial de ${name} ?`)) {
      setLeads((prev) => prev.filter((l) => l.id !== id));
      logAction('Suppression lead', name);
    }
  };

  // --------------------------------------------------------------------------
  // RESERVATION FUNCTIONS
  // --------------------------------------------------------------------------
  const handleUpdateReservationStatus = (id: string, status: 'CONFIRMED' | 'CANCELLED' | 'PENDING') => {
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    logAction(`Statut réservation (${status})`, id);
  };

  // --------------------------------------------------------------------------
  // CMS ARTICLE FUNCTIONS
  // --------------------------------------------------------------------------
  const openAddArticleModal = () => {
    setEditingArticle(null);
    setArtTitle('');
    setArtCategory('Architecture');
    setArtExcerpt('');
    setArtContent('');
    setArtReadTime('4 min');
    setArtCoverImage('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80');
    setArticleModalOpen(true);
  };

  const openEditArticleModal = (art: BlogPost) => {
    setEditingArticle(art);
    setArtTitle(typeof art.title === 'string' ? art.title : art.title.fr);
    setArtCategory(art.category);
    setArtExcerpt(typeof art.excerpt === 'string' ? art.excerpt : art.excerpt.fr);
    const contentText = typeof art.content === 'string' ? art.content : art.content?.fr || (typeof art.excerpt === 'string' ? art.excerpt : art.excerpt.fr);
    setArtContent(contentText);
    setArtReadTime(art.readTime);
    setArtCoverImage(art.coverImage);
    setArticleModalOpen(true);
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    const titleObj = { fr: artTitle, ar: artTitle, en: artTitle };
    const excerptObj = { fr: artExcerpt, ar: artExcerpt, en: artExcerpt };
    const contentObj = { fr: artContent, ar: artContent, en: artContent };

    if (editingArticle) {
      setArticles((prev) =>
        prev.map((a) =>
          a.id === editingArticle.id
            ? {
                ...a,
                title: titleObj,
                category: artCategory,
                excerpt: excerptObj,
                content: contentObj,
                readTime: artReadTime,
                coverImage: artCoverImage,
              }
            : a
        )
      );
      logAction('Modification article', artTitle);
    } else {
      const newArt: BlogPost = {
        id: `art-${Date.now()}`,
        slug: artTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title: titleObj,
        category: artCategory,
        excerpt: excerptObj,
        content: contentObj,
        publishedAt: new Date().toISOString().split('T')[0],
        readTime: artReadTime,
        coverImage: artCoverImage,
        author: user?.name ? `${user.name} — Conseiller Villa Regia` : 'Rédaction Villa Regia',
      };
      setArticles((prev) => [newArt, ...prev]);
      logAction('Création article journal', artTitle);
    }
    setArticleModalOpen(false);
  };

  const handleDeleteArticle = (id: string, title: string) => {
    if (confirm(`Supprimer l'article "${title}" ?`)) {
      setArticles((prev) => prev.filter((a) => a.id !== id));
      logAction('Suppression article', title);
    }
  };

  // --------------------------------------------------------------------------
  // STAFF USER MANAGEMENT FUNCTIONS (CREATE, EDIT, PASSWORD, ROLE, DELETE)
  // --------------------------------------------------------------------------
  const handleOpenCreateStaff = () => {
    setEditingUserId(null);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('AGENT');
    setNewUserPassword('');
    setNewUserPhone('');
    setUserModalError(null);
    setUserModalOpen(true);
  };

  const handleOpenEditStaff = (u: UserAccount) => {
    setEditingUserId(u.id);
    setNewUserName(u.name);
    setNewUserEmail(u.email);
    setNewUserRole(u.role);
    setNewUserPassword('');
    setNewUserPhone(u.phone || '');
    setUserModalError(null);
    setUserModalOpen(true);
  };

  const handleSaveStaffUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserModalError(null);

    if (!newUserName.trim() || newUserName.trim().length < 2) {
      setUserModalError('Veuillez renseigner le nom complet du collaborateur.');
      return;
    }

    if (!newUserEmail.trim() || !newUserEmail.includes('@')) {
      setUserModalError('Veuillez renseigner une adresse email valide.');
      return;
    }

    if (!editingUserId && (!newUserPassword || newUserPassword.length < 6)) {
      setUserModalError('Le mot de passe initial doit comporter au minimum 6 caractères.');
      return;
    }

    if (editingUserId && newUserPassword && newUserPassword.length < 6) {
      setUserModalError('Le nouveau mot de passe doit comporter au minimum 6 caractères.');
      return;
    }

    try {
      if (editingUserId) {
        // Edit existing staff user
        const res = await fetch('/api/admin/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingUserId,
            email: newUserEmail.trim(),
            name: newUserName.trim(),
            role: newUserRole,
            phone: newUserPhone.trim(),
            password: newUserPassword ? newUserPassword.trim() : undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setUserModalError(data.error || 'Erreur lors de la mise à jour.');
          return;
        }

        setStaffUsers((prev) =>
          prev.map((u) =>
            u.id === editingUserId
              ? { ...u, name: newUserName.trim(), email: newUserEmail.trim(), role: newUserRole, phone: newUserPhone.trim() }
              : u
          )
        );
        logAction('Mise à jour compte staff', `${newUserName} (${newUserRole})`);
      } else {
        // Create new staff user with password
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newUserName.trim(),
            email: newUserEmail.trim(),
            role: newUserRole,
            password: newUserPassword.trim(),
            phone: newUserPhone.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setUserModalError(data.error || 'Erreur lors de la création.');
          return;
        }

        const createdUser: UserAccount = data.user || {
          id: `usr-${Date.now()}`,
          name: newUserName.trim(),
          email: newUserEmail.trim(),
          role: newUserRole,
          phone: newUserPhone.trim(),
          createdAt: new Date().toISOString().split('T')[0],
        };

        setStaffUsers((prev) => [...prev, createdUser]);
        logAction('Création compte staff avec mot de passe', `${newUserName} (${newUserRole})`);
      }

      setUserModalOpen(false);
    } catch (err) {
      setUserModalError('Erreur de communication avec le serveur.');
    }
  };

  const handleChangeStaffRole = async (userId: string, newRole: UserRole, userName: string, userEmail: string) => {
    setStaffUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    try {
      await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, email: userEmail, role: newRole }),
      });
    } catch {}
    logAction(`Rôle modifié (${newRole})`, userName);
  };

  const handleDeleteStaffUser = async (userId: string, userName: string, userEmail: string) => {
    if (confirm(`Révoquer et supprimer définitivement le compte staff de ${userName} (${userEmail}) ?`)) {
      try {
        await fetch(`/api/admin/users?email=${encodeURIComponent(userEmail)}&id=${userId}`, {
          method: 'DELETE',
        });
      } catch {}
      setStaffUsers((prev) => prev.filter((u) => u.id !== userId));
      logAction('Révocation compte staff', userName);
    }
  };

  const isAuthorizedStaff = user && is2FAVerified && ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'CONTENT_MANAGER'].includes(user.role);

  // --------------------------------------------------------------------------
  // AUTHENTICATION GUARD SCREEN
  // --------------------------------------------------------------------------
  if (!isAuthorizedStaff) {
    return (
      <div className="pt-28 pb-24 bg-brand-navy min-h-screen text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 glass-navy p-10 rounded-2xl max-w-xl w-full border border-brand-gold/30 shadow-2xl space-y-8">
          
          <div className="text-center space-y-4">
            <div className="relative w-44 h-12 mx-auto">
              <Image src="/images/logo-light.png" alt="Villa Regia" fill className="object-contain" />
            </div>

            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-brand-gold bg-brand-gold/10 px-3.5 py-1.5 rounded border border-brand-gold/20 inline-block">
              Accès Réservé à l’Administration & CRM
            </span>

            <h1 className="font-editorial text-3xl font-light text-brand-travertine">
              Espace Gestionnaire Villa Regia
            </h1>

            <p className="text-xs text-brand-travertine/70 leading-relaxed max-w-md mx-auto font-light">
              Les visiteurs peuvent librement naviguer et réserver sur le site public. La connexion avec un rôle habilité est requise pour accéder au tableau de bord.
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/10 text-center">
            <span className="text-[10px] font-mono uppercase text-brand-gold block font-bold tracking-wider">
              Authentification Sécurisée Staff (Validation 2FA par Email)
            </span>
            <p className="text-xs text-brand-travertine/70 max-w-sm mx-auto">
              Veuillez vous connecter avec vos identifiants staff pour recevoir votre code 2FA à 6 chiffres par email.
            </p>
          </div>

          <div className="text-center pt-2">
            <Link href="/" className="inline-flex items-center gap-2 text-xs text-brand-travertine/60 hover:text-brand-gold transition-colors">
              <span>← Retourner au site public Villa Regia</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredProperties = properties.filter((p) => {
    if (universeFilter !== 'ALL' && p.universe !== universeFilter) return false;
    if (propertySearch && !p.title.fr.toLowerCase().includes(propertySearch.toLowerCase()) && !p.location.district.toLowerCase().includes(propertySearch.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="pt-24 pb-24 bg-brand-navy-dark min-h-screen text-brand-travertine">
      
      {/* Top Executive Header Bar */}
      <div className="glass-navy border-b border-brand-gold/20 py-4 sm:py-5 px-4 sm:px-6 mb-6 sm:mb-8 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          
          {/* Top Row: Brand + User Info + Logout */}
          <div className="flex items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-28 sm:w-36 h-7 sm:h-9 shrink-0">
                <Image src="/images/logo-light.png" alt="Villa Regia" fill className="object-contain" priority />
              </div>
              <div className="h-6 sm:h-8 w-px bg-white/15 shrink-0" />
              <div className="min-w-0 truncate">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] sm:text-[10px] font-mono uppercase bg-brand-gold text-brand-navy font-bold px-2 py-0.5 rounded shadow">
                    {user.role}
                  </span>
                  <span className="text-[10px] sm:text-xs text-brand-travertine/60 font-mono truncate max-w-[140px] sm:max-w-none">{user.email}</span>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 hidden sm:inline-flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>2FA</span>
                  </span>
                </div>
                <h1 className="text-xs sm:text-sm font-bold text-brand-travertine truncate mt-0.5">
                  {user.name}
                </h1>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-brand-travertine/60 hover:text-red-400 border border-white/10 transition-colors shrink-0 flex items-center gap-1.5 text-xs"
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline font-mono">Quitter</span>
            </button>
          </div>

          {/* Navigation Tabs - Mobile Swipeable with Horizontal Scroll */}
          <div className="w-full overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-1.5 bg-brand-navy/90 p-1.5 rounded-xl border border-white/10 min-w-max">
              <button
                onClick={() => setActiveTab('kpi')}
                className={`px-3 sm:px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeTab === 'kpi' ? 'bg-brand-gold text-brand-navy shadow-md font-bold' : 'text-brand-travertine/70 hover:text-white'
                }`}
              >
                Tableau de Bord
              </button>

              {hasPermission('properties.read') && (
                <button
                  onClick={() => setActiveTab('properties')}
                  className={`px-3 sm:px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                    activeTab === 'properties' ? 'bg-brand-gold text-brand-navy shadow-md font-bold' : 'text-brand-travertine/70 hover:text-white'
                  }`}
                >
                  Biens ({properties.length})
                </button>
              )}

              {hasPermission('properties.read') && (
                <button
                  onClick={() => setActiveTab('submissions')}
                  className={`px-3 sm:px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'submissions' ? 'bg-brand-gold text-brand-navy shadow-md font-bold' : 'text-brand-travertine/70 hover:text-white'
                  }`}
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Soumissions ({submissions.filter(s => s.status === 'PENDING').length})</span>
                </button>
              )}

              {hasPermission('leads.read') && (
                <button
                  onClick={() => setActiveTab('crm')}
                  className={`px-3 sm:px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                    activeTab === 'crm' ? 'bg-brand-gold text-brand-navy shadow-md font-bold' : 'text-brand-travertine/70 hover:text-white'
                  }`}
                >
                  Pipeline CRM ({leads.length})
                </button>
              )}

              {hasPermission('reservations.read') && (
                <button
                  onClick={() => setActiveTab('reservations')}
                  className={`px-3 sm:px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                    activeTab === 'reservations' ? 'bg-brand-gold text-brand-navy shadow-md font-bold' : 'text-brand-travertine/70 hover:text-white'
                  }`}
                >
                  Réservations ({reservations.length})
                </button>
              )}

              {hasPermission('content.manage') && (
                <button
                  onClick={() => setActiveTab('articles')}
                  className={`px-3 sm:px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                    activeTab === 'articles' ? 'bg-brand-gold text-brand-navy shadow-md font-bold' : 'text-brand-travertine/70 hover:text-white'
                  }`}
                >
                  Journal ({articles.length})
                </button>
              )}

              {hasPermission('users.manage') && (
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-3 sm:px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                    activeTab === 'users' ? 'bg-brand-gold text-brand-navy shadow-md font-bold' : 'text-brand-travertine/70 hover:text-white'
                  }`}
                >
                  Staff ({staffUsers.length})
                </button>
              )}

              {hasPermission('users.manage') && (
                <button
                  onClick={() => setActiveTab('audit')}
                  className={`px-3 sm:px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                    activeTab === 'audit' ? 'bg-brand-gold text-brand-navy shadow-md font-bold' : 'text-brand-travertine/70 hover:text-white'
                  }`}
                >
                  Audit Logs
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Main Admin Content Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* TAB 1: KPI OVERVIEW */}
        {activeTab === 'kpi' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card p-6 rounded-xl border border-brand-gold/20 space-y-2">
                <span className="text-xs font-mono text-brand-travertine/60 uppercase block">Portfolio Actif</span>
                <div className="text-3xl font-bold text-brand-travertine flex items-center justify-between font-editorial">
                  <span>{properties.length}</span>
                  <Building2 className="w-6 h-6 text-brand-gold" />
                </div>
                <span className="text-[11px] text-emerald-400 font-mono">
                  {properties.filter(p => p.status === 'DISPONIBLE').length} Disponibles immédiatement
                </span>
              </div>

              <div className="glass-card p-6 rounded-xl border border-brand-gold/20 space-y-2">
                <span className="text-xs font-mono text-brand-travertine/60 uppercase block">Dossiers Propriétaires</span>
                <div className="text-3xl font-bold text-brand-travertine flex items-center justify-between font-editorial">
                  <span>{submissions.length}</span>
                  <FileCheck className="w-6 h-6 text-brand-gold" />
                </div>
                <span className="text-[11px] text-brand-gold font-mono">
                  {submissions.filter(s => s.status === 'PENDING').length} En attente d'approbation
                </span>
              </div>

              <div className="glass-card p-6 rounded-xl border border-brand-gold/20 space-y-2">
                <span className="text-xs font-mono text-brand-travertine/60 uppercase block">Opportunités CRM</span>
                <div className="text-3xl font-bold text-brand-travertine flex items-center justify-between font-editorial">
                  <span>{leads.length}</span>
                  <Users className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="text-[11px] text-emerald-400 font-mono">
                  {leads.filter(l => l.status === 'Visite' || l.status === 'Offre').length} En négociation avancée
                </span>
              </div>

              <div className="glass-card p-6 rounded-xl border border-brand-gold/20 space-y-2">
                <span className="text-xs font-mono text-brand-travertine/60 uppercase block">Valeur Portfolio</span>
                <div className="text-3xl font-bold text-brand-gold flex items-center justify-between font-editorial">
                  <span>{(properties.reduce((sum, p) => sum + (p.price.amount > 100000 ? p.price.amount : 0), 0) / 1000000).toFixed(1)}M TND</span>
                  <TrendingUp className="w-6 h-6 text-brand-gold" />
                </div>
                <span className="text-[11px] text-brand-travertine/60 font-mono">Sfax & Tunis Riviera</span>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-navy p-6 rounded-xl border border-brand-gold/20 space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-brand-gold flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Biens & Soumissions
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab('submissions')}
                    className="w-full text-left p-3 rounded bg-white/5 hover:bg-brand-gold/20 hover:text-brand-gold border border-white/10 text-xs font-semibold flex items-center justify-between transition-all"
                  >
                    <span>Revoir les Soumissions Propriétaires ({submissions.filter(s => s.status === 'PENDING').length})</span>
                    <FileCheck className="w-4 h-4 text-brand-gold" />
                  </button>
                  <button
                    onClick={openAddPropertyModal}
                    className="w-full text-left p-3 rounded bg-white/5 hover:bg-brand-gold/20 hover:text-brand-gold border border-white/10 text-xs font-semibold flex items-center justify-between transition-all"
                  >
                    <span>Saisir Directement une Propriété</span>
                    <Plus className="w-4 h-4 text-brand-gold" />
                  </button>
                </div>
              </div>

              <div className="glass-navy p-6 rounded-xl border border-brand-gold/20 space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-brand-gold flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Actions Rapides CRM
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setNewLeadModalOpen(true)}
                    className="w-full text-left p-3 rounded bg-white/5 hover:bg-brand-gold/20 hover:text-brand-gold border border-white/10 text-xs font-semibold flex items-center justify-between transition-all"
                  >
                    <span>Saisir un Nouveau Lead Client</span>
                    <UserPlus className="w-4 h-4 text-emerald-400" />
                  </button>
                  <button
                    onClick={() => setActiveTab('crm')}
                    className="w-full text-left p-3 rounded bg-white/5 hover:bg-brand-gold/20 hover:text-brand-gold border border-white/10 text-xs font-semibold flex items-center justify-between transition-all"
                  >
                    <span>Ouvrir le Pipeline Kanban</span>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                  </button>
                </div>
              </div>

              <div className="glass-navy p-6 rounded-xl border border-brand-gold/20 space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-brand-gold flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Éditorial & CMS
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={openAddArticleModal}
                    className="w-full text-left p-3 rounded bg-white/5 hover:bg-brand-gold/20 hover:text-brand-gold border border-white/10 text-xs font-semibold flex items-center justify-between transition-all"
                  >
                    <span>Rédiger un Article de Journal</span>
                    <Plus className="w-4 h-4 text-sky-400" />
                  </button>
                  <button
                    onClick={() => setActiveTab('articles')}
                    className="w-full text-left p-3 rounded bg-white/5 hover:bg-brand-gold/20 hover:text-brand-gold border border-white/10 text-xs font-semibold flex items-center justify-between transition-all"
                  >
                    <span>Gérer les Publications ({articles.length})</span>
                    <ArrowRight className="w-4 h-4 text-sky-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Audit Log Stream */}
            <div className="glass-card p-6 rounded-xl border border-brand-gold/20 space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-brand-gold">Journal d'Activité Récente</h2>
                <span className="text-xs font-mono text-brand-travertine/50">{auditLogs.length} événements</span>
              </div>
              <div className="divide-y divide-white/5 text-xs">
                {auditLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="py-3 flex items-center justify-between font-mono text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="bg-brand-gold/15 text-brand-gold px-2 py-0.5 rounded text-[10px]">{log.role}</span>
                      <span className="text-white font-bold">{log.userName}:</span>
                      <span className="text-brand-travertine/80">{log.action} ({log.target})</span>
                    </div>
                    <span className="text-brand-travertine/40">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: OWNER SUBMISSIONS ("PROPOSER UN BIEN") */}
        {activeTab === 'submissions' && hasPermission('properties.read') && (
          <div className="glass-navy p-6 rounded-xl border border-brand-gold/30 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-brand-gold">
                  Dossiers de Soumissions Propriétaires ("Proposer un bien")
                </h2>
                <p className="text-xs text-brand-travertine/60 font-light mt-0.5">
                  Examinez les propositions soumises par les propriétaires et convertissez-les en 1-click au catalogue public.
                </p>
              </div>

              <Link
                href="/proposer-un-bien"
                target="_blank"
                className="bg-white/10 hover:bg-white/20 text-brand-travertine px-3.5 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-white/10"
              >
                <span>Ouvrir Formulaire Public</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Mobile View: Cards */}
            <div className="space-y-4 block lg:hidden">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="glass-card p-4 rounded-2xl border border-white/10 space-y-3 shadow-xl"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-xs text-brand-gold">{sub.refCode}</span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      sub.status === 'APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : sub.status === 'REJECTED'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {sub.status === 'APPROVED' ? 'Approuvé' : sub.status === 'REJECTED' ? 'Refusé' : 'En Attente'}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    {sub.photos && sub.photos.length > 0 ? (
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-brand-gold/30 shrink-0">
                        <img src={sub.photos[0]} alt="Bien" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 shrink-0 text-[10px]">
                        Sans photo
                      </div>
                    )}
                    <div className="space-y-1 min-w-0">
                      <div className="font-bold text-sm text-white truncate">{sub.propertyType}</div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-brand-gold/15 text-brand-gold px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                          {sub.objective}
                        </span>
                        <span className="text-xs text-white/70">{sub.district}, {sub.city}</span>
                      </div>
                      <div className="text-xs font-mono font-bold text-brand-gold">
                        {(sub.estimatedPrice || sub.estimatedValue || 0).toLocaleString()} TND • {sub.surfaceM2} m² ({sub.bedrooms || 0} ch.)
                      </div>
                    </div>
                  </div>

                  {/* Tunisian Legal Title Badge */}
                  {sub.titleType && (
                    <div className="p-2.5 rounded-xl bg-brand-gold/10 border border-brand-gold/20 text-[11px] font-mono flex items-center justify-between text-brand-gold">
                      <span>⚖️ {sub.titleType}</span>
                      {sub.titleNumber && <span className="font-bold">N° {sub.titleNumber}</span>}
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-white/5 border border-white/8 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Propriétaire:</span>
                      <span className="font-semibold text-white">{sub.ownerName}</span>
                    </div>
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-white/60">Téléphone:</span>
                      <a href={`tel:${sub.ownerPhone}`} className="text-brand-gold hover:underline">{sub.ownerPhone}</a>
                    </div>
                    {sub.address && (
                      <div className="text-[11px] text-brand-travertine/60 pt-1 border-t border-white/5 truncate">
                        📍 {sub.address}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                    <button
                      onClick={() => setInspectingSubmission(sub)}
                      className="bg-brand-gold/15 hover:bg-brand-gold/25 text-brand-gold border border-brand-gold/30 p-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold font-mono transition-all"
                      title="Examiner l'intégralité du dossier"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-[11px]">Détails</span>
                    </button>

                    {sub.status === 'PENDING' && (
                      <button
                        onClick={() => handleApproveSubmission(sub)}
                        className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 py-2.5 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approuver</span>
                      </button>
                    )}

                    <a
                      href={`https://wa.me/${sub.ownerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${sub.ownerName}, concernant votre dossier ${sub.refCode} soumis à Villa Regia...`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 p-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold"
                      title="WhatsApp Propriétaire"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-[11px]">WhatsApp</span>
                    </a>

                    {sub.status === 'PENDING' && (
                      <button
                        onClick={() => handleRejectSubmission(sub.id, sub.refCode)}
                        className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        title="Refuser le dossier"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Table */}
            <div className="overflow-x-auto hidden lg:block">
              <table className="w-full text-left text-xs text-brand-travertine/80">
                <thead className="bg-brand-navy text-brand-gold font-mono uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Réf Dossier</th>
                    <th className="p-3">Propriétaire</th>
                    <th className="p-3">Bien Proposé</th>
                    <th className="p-3">Univers</th>
                    <th className="p-3">Localisation & Titre</th>
                    <th className="p-3">Surface / Pièces</th>
                    <th className="p-3">Prix Estimé</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3 text-right">Actions Staff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-mono font-bold text-brand-gold">{sub.refCode}</td>
                      <td className="p-3">
                        <span className="font-semibold text-white">{sub.ownerName}</span>
                        <div className="text-[10px] text-brand-travertine/50 font-mono">{sub.ownerPhone}</div>
                        {sub.ownerEmail && <div className="text-[10px] text-brand-travertine/40 font-mono truncate max-w-[150px]">{sub.ownerEmail}</div>}
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-white">{sub.propertyType}</span>
                        {sub.photos && sub.photos.length > 0 ? (
                          <div className="flex items-center gap-1.5 mt-1">
                            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-brand-gold/40 shrink-0">
                              <img src={sub.photos[0]} alt="Miniature" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[10px] font-mono text-brand-gold font-bold">
                              {sub.photos.length} photo(s)
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-brand-travertine/40 block mt-0.5">Aucun visuel</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="bg-brand-gold/15 text-brand-gold px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                          {sub.objective}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="text-white font-medium">{sub.district}, {sub.city}</div>
                        {sub.titleType && (
                          <div className="text-[10px] font-mono text-brand-gold mt-0.5">
                            ⚖️ {sub.titleType} {sub.titleNumber ? `(N° ${sub.titleNumber})` : ''}
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-mono">{sub.surfaceM2} m² ({sub.bedrooms || 0} ch.)</td>
                      <td className="p-3 font-mono text-brand-gold font-bold">
                        {(sub.estimatedPrice || sub.estimatedValue || 0).toLocaleString()} TND
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                          sub.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : sub.status === 'REJECTED'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {sub.status === 'APPROVED' ? 'Approuvé' : sub.status === 'REJECTED' ? 'Refusé' : 'En Attente'}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setInspectingSubmission(sub)}
                          className="bg-white/5 hover:bg-brand-gold/20 text-brand-travertine hover:text-brand-gold p-2 rounded-lg inline-flex items-center gap-1 transition-colors"
                          title="Examiner l'intégralité du formulaire et pièces jointes"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-mono">Dossier</span>
                        </button>

                        {sub.status === 'PENDING' && (
                          <button
                            onClick={() => handleApproveSubmission(sub)}
                            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all inline-flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approuver & Publier</span>
                          </button>
                        )}

                        <a
                          href={`https://wa.me/${sub.ownerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${sub.ownerName}, concernant votre dossier ${sub.refCode} soumis à Villa Regia...`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white/5 hover:bg-emerald-500/20 text-brand-travertine hover:text-emerald-400 p-2 rounded-lg inline-block transition-colors"
                          title="WhatsApp Propriétaire"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>

                        {sub.status === 'PENDING' && (
                          <button
                            onClick={() => handleRejectSubmission(sub.id, sub.refCode)}
                            className="p-2 rounded-lg bg-white/5 text-brand-travertine/40 hover:text-red-400 transition-colors"
                            title="Refuser le dossier"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: FUNCTIONAL PROPERTIES MANAGEMENT */}
        {activeTab === 'properties' && hasPermission('properties.read') && (
          <div className="glass-navy p-6 rounded-xl border border-brand-gold/30 space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="Rechercher par titre ou quartier..."
                    value={propertySearch}
                    onChange={(e) => setPropertySearch(e.target.value)}
                    className="w-full bg-brand-navy border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-gold"
                  />
                  <Search className="w-4 h-4 text-brand-travertine/40 absolute right-3 top-3" />
                </div>

                <select
                  value={universeFilter}
                  onChange={(e) => setUniverseFilter(e.target.value)}
                  className="bg-brand-navy border border-white/20 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-gold"
                >
                  <option value="ALL">Tous les Univers</option>
                  <option value="VENTE">VENTE</option>
                  <option value="RESIDENCE">RÉSIDENCE</option>
                  <option value="LUXE">VILLAS DE LUXE</option>
                  <option value="EVENT">ÉVÉNEMENTIEL</option>
                </select>
              </div>

              {hasPermission('properties.create') && (
                <button
                  onClick={openAddPropertyModal}
                  className="bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-navy px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow hover:opacity-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter une Propriété</span>
                </button>
              )}
            </div>

            {/* Mobile View: Cards */}
            <div className="space-y-4 block lg:hidden">
              {filteredProperties.map((p) => (
                <div
                  key={p.id}
                  className="glass-card p-4 rounded-xl border border-white/10 space-y-3"
                >
                  <div className="flex gap-3">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-brand-gold/30 shrink-0">
                      <Image src={p.images[0]?.url || ''} alt={p.title.fr} fill className="object-cover" />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-bold text-sm text-white line-clamp-1">{p.title.fr}</span>
                        <button
                          onClick={() => handleToggleFeatured(p.id, p.isFeatured || false, p.title.fr)}
                          className={`p-1 rounded shrink-0 transition-colors ${
                            p.isFeatured ? 'text-amber-400 bg-amber-400/10' : 'text-slate-600 hover:text-amber-400'
                          }`}
                          title="En Une"
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-brand-gold/15 text-brand-gold px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                          {p.universe}
                        </span>
                        <span className="text-xs text-white/60">{p.category}</span>
                      </div>

                      <div className="text-xs text-white/70 truncate">{p.location.district}, {p.location.city}</div>

                      <div className="text-xs font-mono font-bold text-brand-gold">
                        {p.price.amount.toLocaleString()} {p.price.currency}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                    <button
                      onClick={() => handleToggleStatus(p.id, p.status, p.title.fr)}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                        p.status === 'DISPONIBLE'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {p.status}
                    </button>

                    <div className="flex items-center gap-1">
                      <Link
                        href={`/properties/${p.id}`}
                        target="_blank"
                        className="p-2 rounded-lg bg-white/5 text-brand-gold hover:bg-white/10"
                        title="Voir fiche publique"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleCreateLeadFromProperty(p)}
                        className="p-2 rounded-lg bg-white/5 text-emerald-400 hover:bg-white/10"
                        title="Créer Lead CRM"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditPropertyModal(p)}
                        className="p-2 rounded-lg bg-white/5 text-brand-travertine hover:text-brand-gold hover:bg-white/10"
                        title="Modifier"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicateProperty(p)}
                        className="p-2 rounded-lg bg-white/5 text-sky-400 hover:bg-white/10"
                        title="Dupliquer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {hasPermission('properties.delete') && (
                        <button
                          onClick={() => handleDeleteProperty(p.id, p.title.fr)}
                          className="p-2 rounded-lg bg-white/5 text-red-400 hover:bg-white/10"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Table */}
            <div className="overflow-x-auto hidden lg:block">
              <table className="w-full text-left text-xs text-brand-travertine/80">
                <thead className="bg-brand-navy text-brand-gold font-mono uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Visuel</th>
                    <th className="p-3">Intitulé du Bien</th>
                    <th className="p-3">Univers</th>
                    <th className="p-3">Catégorie</th>
                    <th className="p-3">Localisation</th>
                    <th className="p-3">Prix</th>
                    <th className="p-3">Une</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3 text-right">Actions Operatoires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredProperties.map((p) => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3">
                        <div className="relative w-12 h-10 rounded overflow-hidden">
                          <Image src={p.images[0]?.url || ''} alt={p.title.fr} fill className="object-cover" />
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-white max-w-xs truncate">
                        {p.title.fr}
                        <div className="flex items-center gap-2 mt-0.5">
                          <Link
                            href={`/properties/${p.id}`}
                            target="_blank"
                            className="text-[10px] text-brand-gold hover:underline inline-flex items-center gap-1"
                          >
                            <span>Voir fiche</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="bg-brand-gold/15 text-brand-gold px-2 py-0.5 rounded text-[10px] font-mono">
                          {p.universe}
                        </span>
                      </td>
                      <td className="p-3 text-brand-travertine/70">{p.category}</td>
                      <td className="p-3 text-brand-travertine/70">{p.location.district}, {p.location.city}</td>
                      <td className="p-3 font-mono text-brand-gold font-bold">
                        {p.price.amount.toLocaleString()} {p.price.currency}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleToggleFeatured(p.id, p.isFeatured || false, p.title.fr)}
                          className={`p-1.5 rounded transition-colors ${
                            p.isFeatured ? 'text-amber-400 bg-amber-400/10' : 'text-slate-600 hover:text-amber-400'
                          }`}
                          title="Basculer En Une"
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleToggleStatus(p.id, p.status, p.title.fr)}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                            p.status === 'DISPONIBLE'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {p.status}
                        </button>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleCreateLeadFromProperty(p)}
                          className="p-1.5 rounded bg-white/5 text-emerald-400 hover:bg-emerald-500/20"
                          title="Créer un Lead CRM"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditPropertyModal(p)}
                          className="p-1.5 rounded bg-white/5 text-brand-travertine hover:text-brand-gold hover:bg-white/10"
                          title="Éditer la fiche"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicateProperty(p)}
                          className="p-1.5 rounded bg-white/5 text-brand-travertine hover:text-sky-400 hover:bg-white/10"
                          title="Dupliquer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {hasPermission('properties.delete') && (
                          <button
                            onClick={() => handleDeleteProperty(p.id, p.title.fr)}
                            className="p-1.5 rounded bg-white/5 text-brand-travertine/50 hover:text-red-400 hover:bg-white/10"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 3: FUNCTIONAL CRM LEAD PIPELINE */}
        {activeTab === 'crm' && hasPermission('leads.read') && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-brand-gold">
                  Pipeline Commercial CRM & Suivi Client
                </h2>
                <span className="text-xs text-brand-travertine/60 font-mono">
                  {leads.length} opportunité(s) active(s)
                </span>
              </div>

              <button
                onClick={() => setNewLeadModalOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3.5 py-2 rounded text-xs uppercase tracking-wider flex items-center gap-2 shadow"
              >
                <UserPlus className="w-4 h-4" />
                <span>Nouveau Lead Client</span>
              </button>
            </div>
            
            <div className="flex md:grid md:grid-cols-5 gap-4 overflow-x-auto pb-4 scrollbar-none snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
              {(['Nouveau', 'Contacté', 'Visite', 'Offre', 'Conclu'] as const).map((stage) => {
                const stageLeads = leads.filter((l) => l.status === stage);
                return (
                  <div key={stage} className="glass-card rounded-xl p-4 space-y-3 min-h-[360px] border border-brand-gold/15 min-w-[280px] sm:min-w-[300px] md:min-w-0 snap-start flex-1 shrink-0">
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <span className="text-xs font-mono font-bold text-brand-travertine uppercase">{stage}</span>
                      <span className="text-[10px] bg-brand-gold text-brand-navy px-2 py-0.5 rounded font-mono font-bold">
                        {stageLeads.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {stageLeads.map((lead) => (
                        <div
                          key={lead.id}
                          className="glass-navy p-4 rounded-lg border border-white/10 space-y-3 hover:border-brand-gold/40 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-white">{lead.name}</span>
                            <span className="text-[9px] bg-brand-gold/15 text-brand-gold px-1.5 py-0.5 rounded font-mono">
                              {lead.universe}
                            </span>
                          </div>

                          <p className="text-[11px] text-brand-travertine/70 line-clamp-1">{lead.propertyTitle}</p>

                          <div className="space-y-1 text-[10px] text-brand-travertine/50">
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-brand-gold shrink-0" />
                              <span>{lead.phone}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3 h-3 text-brand-gold shrink-0" />
                              <span className="truncate">{lead.email}</span>
                            </div>
                          </div>

                          {lead.notes && (
                            <p className="text-[10px] text-brand-travertine/60 italic bg-brand-navy p-2 rounded line-clamp-2">
                              « {lead.notes} »
                            </p>
                          )}

                          <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[10px] font-mono">
                            <span className="text-brand-travertine/60">{lead.assignedAgent || 'Non assigné'}</span>
                            
                            <div className="flex gap-2">
                              <button
                                onClick={() => openLeadModal(lead)}
                                className="text-brand-gold hover:underline font-bold"
                              >
                                Gérer
                              </button>
                              <button
                                onClick={() => handleDeleteLead(lead.id, lead.name)}
                                className="text-brand-travertine/40 hover:text-red-400"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: RESERVATIONS MANAGER */}
        {activeTab === 'reservations' && hasPermission('reservations.read') && (
          <div className="glass-navy p-6 rounded-xl border border-brand-gold/30 space-y-6">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-brand-gold">
              Gestion des Réservations & Acomptes Court Séjour
            </h2>

            {/* Mobile View: Cards */}
            <div className="space-y-4 block lg:hidden">
              {reservations.map((r) => (
                <div key={r.id} className="glass-card p-4 rounded-xl border border-white/10 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-xs text-brand-gold">{r.id}</span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      r.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {r.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">{r.propertyTitle}</h3>
                    <div className="text-xs text-white/60 mt-0.5">{r.guestName} • <span className="font-mono text-brand-gold">{r.guestPhone}</span></div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-white/5 border border-white/8 text-xs font-mono">
                    <div>
                      <span className="text-white/40 block text-[10px]">Dates</span>
                      <span className="text-white/90 text-[11px]">{r.checkIn} → {r.checkOut}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block text-[10px]">Acompte ({r.totalNights} n.)</span>
                      <span className="text-brand-gold font-bold text-xs">{r.depositAmount} TND</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                    {r.status !== 'CONFIRMED' && (
                      <button
                        onClick={() => handleUpdateReservationStatus(r.id, 'CONFIRMED')}
                        className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 py-2 rounded-lg text-xs font-bold uppercase"
                      >
                        Valider
                      </button>
                    )}
                    {r.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleUpdateReservationStatus(r.id, 'CANCELLED')}
                        className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 rounded-lg text-xs font-bold uppercase"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Table */}
            <div className="overflow-x-auto hidden lg:block">
              <table className="w-full text-left text-xs text-brand-travertine/80">
                <thead className="bg-brand-navy text-brand-gold font-mono uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Ref</th>
                    <th className="p-3">Propriété</th>
                    <th className="p-3">Client</th>
                    <th className="p-3">Dates</th>
                    <th className="p-3">Nuits</th>
                    <th className="p-3">Acompte</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3 text-right">Mettre à Jour</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {reservations.map((r) => (
                    <tr key={r.id} className="hover:bg-white/5">
                      <td className="p-3 font-mono text-brand-gold">{r.id}</td>
                      <td className="p-3 font-semibold text-white max-w-xs truncate">{r.propertyTitle}</td>
                      <td className="p-3">{r.guestName}<br /><span className="text-[10px] text-brand-travertine/50">{r.guestPhone}</span></td>
                      <td className="p-3 font-mono text-brand-travertine/70">{r.checkIn} au {r.checkOut}</td>
                      <td className="p-3 font-mono">{r.totalNights} nuits</td>
                      <td className="p-3 font-mono text-brand-gold font-bold">{r.depositAmount} TND</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          r.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        {r.status !== 'CONFIRMED' && (
                          <button
                            onClick={() => handleUpdateReservationStatus(r.id, 'CONFIRMED')}
                            className="bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded text-[10px] font-bold hover:bg-emerald-500/30"
                          >
                            Valider
                          </button>
                        )}
                        {r.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleUpdateReservationStatus(r.id, 'CANCELLED')}
                            className="bg-red-500/20 text-red-400 px-2.5 py-1 rounded text-[10px] font-bold hover:bg-red-500/30"
                          >
                            Annuler
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: CMS & JOURNAL ARTICLES MANAGER */}
        {activeTab === 'articles' && hasPermission('content.manage') && (
          <div className="glass-navy p-6 rounded-xl border border-brand-gold/30 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-brand-gold">
                Gestion des Publications & Articles du Journal
              </h2>

              <button
                onClick={openAddArticleModal}
                className="bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-navy px-4 py-2.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Rédiger un Article</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {articles.map((art) => {
                const titleStr = typeof art.title === 'string' ? art.title : art.title.fr;
                const excerptStr = typeof art.excerpt === 'string' ? art.excerpt : art.excerpt.fr;

                return (
                  <div key={art.id} className="glass-card p-5 rounded-xl border border-white/10 space-y-4 relative group">
                    <div className="relative h-40 w-full rounded-lg overflow-hidden">
                      <Image src={art.coverImage} alt={titleStr} fill className="object-cover group-hover:scale-105 transition-transform" />
                      <span className="absolute top-2 left-2 bg-brand-navy/90 text-brand-gold text-[10px] font-mono px-2 py-0.5 rounded">
                        {art.category}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-semibold text-white text-sm line-clamp-1">{titleStr}</h3>
                      <p className="text-[11px] text-brand-travertine/60 line-clamp-2">{excerptStr}</p>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex justify-between items-center text-[10px] font-mono text-brand-travertine/50">
                      <span>{art.publishedAt}</span>
                      <span>{art.readTime}</span>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        onClick={() => openEditArticleModal(art)}
                        className="p-1.5 rounded bg-white/5 text-brand-travertine hover:text-brand-gold"
                        title="Éditer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(art.id, titleStr)}
                        className="p-1.5 rounded bg-white/5 text-brand-travertine/50 hover:text-red-400"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: USER ACCOUNTS MANAGER (STAFF & CLIENTS DATABASE) */}
        {activeTab === 'users' && hasPermission('users.manage') && (
          <div className="glass-navy p-6 rounded-xl border border-brand-gold/30 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-brand-gold">
                  Gestion des Comptes Utilisateurs (Base de Données & RBAC)
                </h2>
                <p className="text-xs text-brand-travertine/60 font-light mt-0.5">
                  Configurez et modifiez les profils (nom, rôle, téléphone, mot de passe) des collaborateurs et des clients synchronisés en base de données.
                </p>
              </div>

              <button
                onClick={handleOpenCreateStaff}
                className="bg-brand-gold text-brand-navy font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow hover:opacity-95 transition-all shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>Nouveau Compte</span>
              </button>
            </div>

            {/* Filters & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-white/10">
              <div className="flex items-center gap-1.5 p-1 bg-brand-navy rounded-xl border border-white/10 overflow-x-auto text-xs font-mono">
                <button
                  onClick={() => setAccountRoleFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    accountRoleFilter === 'ALL'
                      ? 'bg-brand-gold text-brand-navy font-bold shadow'
                      : 'text-brand-travertine/70 hover:text-white'
                  }`}
                >
                  Tous ({staffUsers.length})
                </button>
                <button
                  onClick={() => setAccountRoleFilter('STAFF')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    accountRoleFilter === 'STAFF'
                      ? 'bg-brand-gold text-brand-navy font-bold shadow'
                      : 'text-brand-travertine/70 hover:text-white'
                  }`}
                >
                  Collaborateurs Staff ({staffUsers.filter(u => u.role !== 'CLIENT').length})
                </button>
                <button
                  onClick={() => setAccountRoleFilter('CLIENT')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    accountRoleFilter === 'CLIENT'
                      ? 'bg-brand-gold text-brand-navy font-bold shadow'
                      : 'text-brand-travertine/70 hover:text-white'
                  }`}
                >
                  Comptes Clients ({staffUsers.filter(u => u.role === 'CLIENT').length})
                </button>
              </div>

              <div className="relative flex-1 sm:max-w-xs">
                <Search className="w-3.5 h-3.5 text-brand-gold absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={accountSearchQuery}
                  onChange={(e) => setAccountSearchQuery(e.target.value)}
                  placeholder="Rechercher nom, email, tél..."
                  className="w-full bg-brand-navy border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/40 focus:border-brand-gold focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Mobile View: Cards */}
            <div className="space-y-4 block lg:hidden">
              {staffUsers
                .filter((u) => {
                  if (accountRoleFilter === 'STAFF' && u.role === 'CLIENT') return false;
                  if (accountRoleFilter === 'CLIENT' && u.role !== 'CLIENT') return false;
                  if (accountSearchQuery.trim()) {
                    const q = accountSearchQuery.toLowerCase().trim();
                    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.phone && u.phone.toLowerCase().includes(q));
                  }
                  return true;
                })
                .map((u) => (
                  <div key={u.id} className="glass-card p-4 rounded-xl border border-white/10 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-2 flex-wrap">
                          <span>{u.name}</span>
                          {u.role === 'CLIENT' ? (
                            <span className="text-[9px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-bold">
                              Compte Client
                            </span>
                          ) : u.role === 'SUPER_ADMIN' ? (
                            <span className="text-[9px] font-mono bg-amber-400/20 text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded font-bold">
                              Direction Générale
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono bg-brand-gold/15 text-brand-gold border border-brand-gold/30 px-2 py-0.5 rounded font-bold">
                              {u.role}
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-brand-travertine/70">{u.email}</div>
                        {u.phone && <div className="text-[11px] font-mono text-brand-gold mt-0.5">{u.phone}</div>}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeStaffRole(u.id, e.target.value as UserRole, u.name, u.email)}
                        className="bg-brand-navy border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-brand-gold font-mono font-bold focus:border-brand-gold focus:outline-none flex-1"
                      >
                        <option value="CLIENT">CLIENT (Espace Privé)</option>
                        <option value="AGENT">AGENT (Commercial)</option>
                        <option value="CONTENT_MANAGER">CONTENT_MANAGER (Éditeur)</option>
                        <option value="ADMIN">ADMIN (Gestionnaire)</option>
                        <option value="SUPER_ADMIN">SUPER_ADMIN (Directeur)</option>
                      </select>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEditStaff(u)}
                          className="p-2 rounded-lg bg-brand-gold/15 text-brand-gold hover:bg-brand-gold hover:text-brand-navy transition-all"
                          title="Configurer ce compte (Nom, Mot de passe, Coordonnées)"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {u.email !== 'yassinealoulou6@gmail.com' && (
                          <button
                            onClick={() => handleDeleteStaffUser(u.id, u.name, u.email)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                            title="Supprimer définitivement de la base de données"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Desktop View: Table */}
            <div className="overflow-x-auto hidden lg:block">
              <table className="w-full text-left text-xs text-brand-travertine/80">
                <thead className="bg-brand-navy text-brand-gold font-mono uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Utilisateur / Profil</th>
                    <th className="p-3">Email Identifiant</th>
                    <th className="p-3">Téléphone</th>
                    <th className="p-3">Type & Rôle Attribué</th>
                    <th className="p-3 text-right">Actions BD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {staffUsers
                    .filter((u) => {
                      if (accountRoleFilter === 'STAFF' && u.role === 'CLIENT') return false;
                      if (accountRoleFilter === 'CLIENT' && u.role !== 'CLIENT') return false;
                      if (accountSearchQuery.trim()) {
                        const q = accountSearchQuery.toLowerCase().trim();
                        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.phone && u.phone.toLowerCase().includes(q));
                      }
                      return true;
                    })
                    .map((u) => (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3">
                          <div className="font-semibold text-white flex items-center gap-2">
                            <span>{u.name}</span>
                            {u.role === 'CLIENT' && (
                              <span className="text-[9px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-bold">
                                Client
                              </span>
                            )}
                            {u.role === 'SUPER_ADMIN' && (
                              <span className="text-[9px] font-mono text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                                Direction
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-mono text-brand-travertine/70">{u.email}</td>
                        <td className="p-3 font-mono text-brand-travertine/60">{u.phone || '—'}</td>
                        <td className="p-3">
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeStaffRole(u.id, e.target.value as UserRole, u.name, u.email)}
                            className="bg-brand-navy border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-brand-gold font-mono font-bold focus:border-brand-gold focus:outline-none"
                          >
                            <option value="CLIENT">CLIENT (Espace Privé)</option>
                            <option value="AGENT">AGENT (Commercial)</option>
                            <option value="CONTENT_MANAGER">CONTENT_MANAGER (Éditeur)</option>
                            <option value="ADMIN">ADMIN (Gestionnaire)</option>
                            <option value="SUPER_ADMIN">SUPER_ADMIN (Directeur)</option>
                          </select>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditStaff(u)}
                              className="p-2 rounded-lg bg-brand-gold/15 text-brand-gold hover:bg-brand-gold hover:text-brand-navy transition-all"
                              title="Configurer (Nom, Mot de Passe, Téléphone, Rôle)"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            {u.email !== 'yassinealoulou6@gmail.com' && (
                              <button
                                onClick={() => handleDeleteStaffUser(u.id, u.name, u.email)}
                                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                                title="Supprimer définitivement de la base de données"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: AUDIT LOGS */}
        {activeTab === 'audit' && hasPermission('users.manage') && (
          <div className="glass-navy p-6 rounded-xl border border-brand-gold/30 space-y-4">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-brand-gold">
              Journal d'Audit Intégral & Preuves des Actions
            </h2>
            <div className="divide-y divide-white/10 text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between font-mono text-[11px]">
                  <div>
                    <span className="text-brand-gold font-bold">{log.userName} ({log.role})</span>
                    <span className="text-brand-travertine/80 ml-2">— {log.action} : {log.target}</span>
                  </div>
                  <span className="text-brand-travertine/40">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* MODAL: ADD / EDIT PROPERTY */}
      {propertyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur flex items-center justify-center p-3 sm:p-4">
          <div className="glass-navy p-4 sm:p-8 rounded-2xl max-w-2xl w-full border border-brand-gold/40 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-editorial text-xl sm:text-2xl font-light text-brand-travertine">
                {editingProperty ? 'Modifier la Fiche Propriété' : 'Ajouter une Propriété au Catalogue'}
              </h3>
              <button onClick={() => setPropertyModalOpen(false)} className="text-white/60 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProperty} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1 font-bold">Titre de la Propriété</label>
                <input
                  required
                  type="text"
                  value={propTitle}
                  onChange={(e) => setPropTitle(e.target.value)}
                  placeholder="ex: Domaine de la Soukra — Villa de Maître"
                  className="w-full bg-brand-navy border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1 font-bold">Univers</label>
                  <select
                    value={propUniverse}
                    onChange={(e) => setPropUniverse(e.target.value as UniverseType)}
                    className="w-full bg-brand-navy border border-white/20 rounded-xl px-3 py-2.5 text-xs text-white"
                  >
                    <option value="VENTE">VENTE</option>
                    <option value="RESIDENCE">RÉSIDENCE</option>
                    <option value="LUXE">VILLAS DE LUXE</option>
                    <option value="EVENT">ÉVÉNEMENTIEL</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1 font-bold">Catégorie</label>
                  <select
                    value={propCategory}
                    onChange={(e) => setPropCategory(e.target.value as PropertyCategory)}
                    className="w-full bg-brand-navy border border-white/20 rounded-xl px-3 py-2.5 text-xs text-white"
                  >
                    <option value="Villa">Villa</option>
                    <option value="Appartement">Appartement</option>
                    <option value="Duplex">Duplex</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="Domaine Événementiel">Domaine Événementiel</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1 font-bold">Prix (TND)</label>
                  <input
                    type="number"
                    value={propPrice}
                    onChange={(e) => setPropPrice(Number(e.target.value))}
                    className="w-full bg-brand-navy border border-white/20 rounded-xl px-3 py-2.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1 font-bold">Surface (m²)</label>
                  <input
                    type="number"
                    value={propSurface}
                    onChange={(e) => setPropSurface(Number(e.target.value))}
                    className="w-full bg-brand-navy border border-white/20 rounded-xl px-3 py-2.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1 font-bold">Chambres</label>
                  <input
                    type="number"
                    value={propBedrooms}
                    onChange={(e) => setPropBedrooms(Number(e.target.value))}
                    className="w-full bg-brand-navy border border-white/20 rounded-xl px-3 py-2.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1 font-bold">Ville</label>
                  <input
                    type="text"
                    value={propCity}
                    onChange={(e) => setPropCity(e.target.value)}
                    className="w-full bg-brand-navy border border-white/20 rounded-xl px-3 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1 font-bold">Quartier / Secteur</label>
                  <input
                    type="text"
                    value={propDistrict}
                    onChange={(e) => setPropDistrict(e.target.value)}
                    className="w-full bg-brand-navy border border-white/20 rounded-xl px-3 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-mono uppercase text-brand-gold block font-bold">
                  Visuel de la Propriété (Chargement de Fichiers & Aperçu)
                </label>

                <div className="p-4 border border-dashed border-white/20 rounded-xl text-center space-y-2 bg-white/5">
                  <input
                    type="file"
                    id="admin-prop-upload"
                    accept="image/*"
                    onChange={(e) => {
                      if (!e.target.files || !e.target.files[0]) return;
                      const file = e.target.files[0];
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        if (ev.target?.result) {
                          setPropImageUrl(ev.target.result as string);
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />
                  <UploadCloud className="w-6 h-6 text-brand-gold mx-auto" />
                  <label
                    htmlFor="admin-prop-upload"
                    className="inline-block bg-brand-gold hover:bg-brand-gold-dark text-brand-navy font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow transition-all"
                  >
                    Charger une photo depuis l'ordinateur
                  </label>
                </div>

                <div className="pt-1">
                  <label className="text-[10px] font-mono text-brand-travertine/60 block mb-1">
                    Ou coller l'URL d'une image web :
                  </label>
                  <input
                    type="text"
                    value={propImageUrl}
                    onChange={(e) => setPropImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-brand-navy border border-white/20 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                {propImageUrl && (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden border border-brand-gold/30 mt-2">
                    <img src={propImageUrl} alt="Aperçu" className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 left-2 bg-brand-navy/90 text-brand-gold text-[10px] font-mono px-2.5 py-0.5 rounded font-bold border border-brand-gold/20">
                      ★ Photo Couverture Active
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1 font-bold">Description Éditoriale</label>
                <textarea
                  rows={3}
                  value={propDesc}
                  onChange={(e) => setPropDesc(e.target.value)}
                  className="w-full bg-brand-navy border border-white/20 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-gold text-brand-navy font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-xl hover:opacity-95 transition-all"
              >
                {editingProperty ? 'Enregistrer les Modifications' : 'Créer et Publier la Propriété'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NEW LEAD CREATOR */}
      {newLeadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur flex items-center justify-center p-3 sm:p-4">
          <div className="glass-navy p-4 sm:p-8 rounded-2xl max-w-md w-full border border-brand-gold/40 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-editorial text-xl sm:text-2xl font-light text-brand-travertine">
                Saisir un Nouveau Lead Client
              </h3>
              <button onClick={() => setNewLeadModalOpen(false)} className="text-white/60 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewLead} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1 font-bold">Nom du Client</label>
                <input
                  required
                  type="text"
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  placeholder="ex: M. Mehdi Ben Salem"
                  className="w-full bg-brand-navy border border-white/20 rounded-xl px-3 py-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1 font-bold">Téléphone</label>
                  <input
                    required
                    type="text"
                    value={newLeadPhone}
                    onChange={(e) => setNewLeadPhone(e.target.value)}
                    placeholder="+216 27 745 405"
                    className="w-full bg-brand-navy border border-white/20 rounded-xl px-3 py-2.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Email</label>
                  <input
                    type="email"
                    value={newLeadEmail}
                    onChange={(e) => setNewLeadEmail(e.target.value)}
                    placeholder="client@mail.tn"
                    className="w-full bg-brand-navy border border-white/20 rounded px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Univers d'Intérêt</label>
                <select
                  value={newLeadUniverse}
                  onChange={(e) => setNewLeadUniverse(e.target.value as UniverseType)}
                  className="w-full bg-brand-navy border border-white/20 rounded px-3 py-2 text-xs text-white"
                >
                  <option value="VENTE">VENTE</option>
                  <option value="RESIDENCE">RÉSIDENCE</option>
                  <option value="LUXE">VILLAS DE LUXE</option>
                  <option value="EVENT">ÉVÉNEMENTIEL</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Intitulé du Bien / Projet</label>
                <input
                  type="text"
                  value={newLeadPropTitle}
                  onChange={(e) => setNewLeadPropTitle(e.target.value)}
                  placeholder="ex: Recherche Villa Soukra"
                  className="w-full bg-brand-navy border border-white/20 rounded px-3 py-2 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-widest py-3 rounded shadow-xl"
              >
                Créer l'Opportunité CRM
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CMS ARTICLE CREATOR / EDITOR */}
      {articleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur flex items-center justify-center p-3 sm:p-4">
          <div className="glass-navy p-4 sm:p-8 rounded-2xl max-w-xl w-full border border-brand-gold/40 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-editorial text-xl sm:text-2xl font-light text-brand-travertine">
                {editingArticle ? 'Éditer l’Article du Journal' : 'Rédiger un Article de Journal'}
              </h3>
              <button onClick={() => setArticleModalOpen(false)} className="text-white/60 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1 font-bold">Titre de l'Article</label>
                <input
                  required
                  type="text"
                  value={artTitle}
                  onChange={(e) => setArtTitle(e.target.value)}
                  placeholder="ex: L’Architecture Contemporaine à Sfax"
                  className="w-full bg-brand-navy border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1 font-bold">Catégorie</label>
                  <select
                    value={artCategory}
                    onChange={(e) => setArtCategory(e.target.value as BlogPost['category'])}
                    className="w-full bg-brand-navy border border-white/20 rounded-xl px-3 py-2.5 text-xs text-white"
                  >
                    <option value="Architecture">Architecture</option>
                    <option value="Investissement">Investissement</option>
                    <option value="Sfax Lifestyle">Sfax Lifestyle</option>
                    <option value="Immobilier de Luxe">Immobilier de Luxe</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1 font-bold">Temps de Lecture</label>
                  <input
                    type="text"
                    value={artReadTime}
                    onChange={(e) => setArtReadTime(e.target.value)}
                    className="w-full bg-brand-navy border border-white/20 rounded-xl px-3 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-mono uppercase text-brand-gold block font-bold">
                  Image Couverture de l'Article (Chargement de Fichier & Aperçu)
                </label>

                <div className="p-4 border border-dashed border-white/20 rounded-xl text-center space-y-2 bg-white/5">
                  <input
                    type="file"
                    id="admin-art-upload"
                    accept="image/*"
                    onChange={(e) => {
                      if (!e.target.files || !e.target.files[0]) return;
                      const file = e.target.files[0];
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        if (ev.target?.result) {
                          setArtCoverImage(ev.target.result as string);
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />
                  <UploadCloud className="w-6 h-6 text-brand-gold mx-auto" />
                  <label
                    htmlFor="admin-art-upload"
                    className="inline-block bg-brand-gold hover:bg-brand-gold-dark text-brand-navy font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow transition-all"
                  >
                    Charger l'image de couverture depuis l'ordinateur
                  </label>
                </div>

                <div className="pt-1">
                  <label className="text-[10px] font-mono text-brand-travertine/60 block mb-1">
                    Ou coller l'URL d'une image web :
                  </label>
                  <input
                    type="text"
                    value={artCoverImage}
                    onChange={(e) => setArtCoverImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-brand-navy border border-white/20 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                {artCoverImage && (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border border-brand-gold/30 mt-2">
                    <img src={artCoverImage} alt="Aperçu Couverture" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1 font-bold">Résumé / Excerpt</label>
                <textarea
                  rows={2}
                  value={artExcerpt}
                  onChange={(e) => setArtExcerpt(e.target.value)}
                  className="w-full bg-brand-navy border border-white/20 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-gold text-brand-navy font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-xl hover:opacity-95 transition-all"
              >
                {editingArticle ? 'Mettre à Jour l’Article' : 'Publier l’Article sur le Journal'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT STAFF USER */}
{/* MODAL: ADD / EDIT STAFF USER */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur flex items-center justify-center p-3 sm:p-4">
          <div className="glass-navy p-4 sm:p-8 rounded-2xl max-w-md w-full border border-brand-gold/40 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-editorial text-xl sm:text-2xl font-light text-brand-travertine">
                {editingUserId ? 'Configuration du Compte (Base de Données)' : 'Créer un Nouveau Compte'}
              </h3>
              <button onClick={() => setUserModalOpen(false)} className="text-white/60 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {userModalError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 font-mono">
                {userModalError}
              </div>
            )}

            <form onSubmit={handleSaveStaffUser} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1 font-bold">
                  Nom Complet de l'Utilisateur
                </label>
                <input
                  required
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="ex: Yassine Triki ou Karim Mansour"
                  className="w-full bg-brand-navy border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1 font-bold">
                  Email Identifiant (Connexion)
                </label>
                <input
                  required
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="utilisateur@domaine.com"
                  className="w-full bg-brand-navy border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white focus:border-brand-gold focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1 font-bold">
                    Type de Profil & Rôle
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full bg-brand-navy border border-white/20 rounded-xl px-3 py-2.5 text-xs text-brand-gold font-mono font-bold focus:border-brand-gold focus:outline-none"
                  >
                    <option value="CLIENT">CLIENT (Espace Privé & Favoris)</option>
                    <option value="AGENT">AGENT (Commercial & Suivi Leads)</option>
                    <option value="CONTENT_MANAGER">CONTENT_MANAGER (Éditeur Journal)</option>
                    <option value="ADMIN">ADMIN (Gestionnaire Catalogue & Réservations)</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Directeur Général)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1 font-bold">
                    Téléphone Direct
                  </label>
                  <input
                    type="tel"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="+216 98 --- ---"
                    className="w-full bg-brand-navy border border-white/20 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:border-brand-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1 font-bold">
                  {editingUserId ? 'Nouveau Mot de Passe (laisser vide pour ne pas modifier)' : 'Mot de Passe Initial (min. 6 caractères)'}
                </label>
                <div className="relative">
                  <input
                    type={showUserPassword ? 'text' : 'password'}
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder={editingUserId ? 'Conserver le mot de passe actuel' : '••••••••••••'}
                    required={!editingUserId}
                    className="w-full bg-brand-navy border border-white/20 rounded-xl px-4 py-2.5 pr-10 text-xs text-white focus:border-brand-gold focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUserPassword(!showUserPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-brand-gold transition-colors"
                  >
                    {showUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-brand-gold/10 border border-brand-gold/20 text-[10px] font-mono text-brand-travertine/70 leading-relaxed">
                Ce compte sera synchronisé et persisté directement en base de données. L'utilisateur pourra se connecter instantanément avec ces identifiants.
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-navy font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-xl hover:opacity-95 transition-all"
              >
                {editingUserId ? 'Enregistrer les Modifications en Base de Données' : 'Créer et Enregistrer en Base de Données'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT LEAD DETAILS & NOTES */}
      {leadModalOpen && activeLead && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur flex items-center justify-center p-4">
          <div className="glass-navy p-8 rounded-xl max-w-md w-full border border-brand-gold/40 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-editorial text-2xl font-light text-brand-travertine">
                Suivi Lead — {activeLead.name}
              </h3>
              <button onClick={() => setLeadModalOpen(false)} className="text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLead} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Statut Pipeline</label>
                <select
                  value={leadStatusInput}
                  onChange={(e) => setLeadStatusInput(e.target.value as Lead['status'])}
                  className="w-full bg-brand-navy border border-white/20 rounded px-3 py-2 text-xs text-white"
                >
                  <option value="Nouveau">Nouveau</option>
                  <option value="Contacté">Contacté</option>
                  <option value="Visite">Visite</option>
                  <option value="Offre">Offre</option>
                  <option value="Conclu">Conclu</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Agent Assigné</label>
                <input
                  type="text"
                  value={leadAgentInput}
                  onChange={(e) => setLeadAgentInput(e.target.value)}
                  className="w-full bg-brand-navy border border-white/20 rounded px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Notes et Historique d'Échange</label>
                <textarea
                  rows={4}
                  value={leadNoteInput}
                  onChange={(e) => setLeadNoteInput(e.target.value)}
                  placeholder="Compte-rendu de la visite ou retour client..."
                  className="w-full bg-brand-navy border border-white/20 rounded px-3 py-2 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-gold text-brand-navy font-bold text-xs uppercase tracking-widest py-3 rounded shadow-xl"
              >
                Mettre à jour le Lead
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INSPECT OWNER SUBMISSION (ALL FORM FIELDS & TUNISIAN LAW) */}
      {inspectingSubmission && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur flex items-center justify-center p-3 sm:p-4">
          <div className="glass-navy p-5 sm:p-8 rounded-2xl max-w-3xl w-full border border-brand-gold/40 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold bg-brand-gold/15 text-brand-gold px-2.5 py-1 rounded border border-brand-gold/30">
                    {inspectingSubmission.refCode}
                  </span>
                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase font-mono ${
                    inspectingSubmission.status === 'APPROVED'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : inspectingSubmission.status === 'REJECTED'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {inspectingSubmission.status === 'APPROVED' ? 'Dossier Approuvé' : inspectingSubmission.status === 'REJECTED' ? 'Dossier Refusé' : 'Dossier En Attente'}
                  </span>
                  <span className="text-[10px] text-white/50 font-mono">
                    Soumis le {new Date(inspectingSubmission.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <h3 className="font-editorial text-2xl sm:text-3xl font-light text-brand-travertine">
                  Inspection du Dossier Propriétaire
                </h3>
              </div>
              <button
                onClick={() => setInspectingSubmission(null)}
                className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Sections */}
            <div className="space-y-5 text-xs text-brand-travertine/80">
              
              {/* Section 1: Propriétaire & Contacts */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-brand-gold font-bold flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>Identité du Propriétaire</span>
                  </span>
                  <a
                    href={`https://wa.me/${inspectingSubmission.ownerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${inspectingSubmission.ownerName}, je vous contacte depuis la direction Villa Regia au sujet de votre bien (${inspectingSubmission.refCode})...`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border border-emerald-500/30"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Ouvrir WhatsApp</span>
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] text-white/50 block font-mono">Nom Complet</span>
                    <span className="font-semibold text-white text-sm">{inspectingSubmission.ownerName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/50 block font-mono">Téléphone Direct</span>
                    <a href={`tel:${inspectingSubmission.ownerPhone}`} className="text-brand-gold hover:underline font-mono font-bold">
                      {inspectingSubmission.ownerPhone}
                    </a>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/50 block font-mono">Adresse Email</span>
                    {inspectingSubmission.ownerEmail ? (
                      <a href={`mailto:${inspectingSubmission.ownerEmail}`} className="text-white/80 hover:text-brand-gold truncate block font-mono">
                        {inspectingSubmission.ownerEmail}
                      </a>
                    ) : (
                      <span className="text-white/40 italic">Non renseignée</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Localisation & Adresse */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-brand-gold font-bold block">
                  📍 Localisation Géographique
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-white/50 block font-mono">Gouvernorat</span>
                    <span className="text-white font-medium">{inspectingSubmission.gouvernorat || 'Sfax'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/50 block font-mono">Délégation / Ville</span>
                    <span className="text-white font-medium">{inspectingSubmission.city}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/50 block font-mono">Quartier / Secteur</span>
                    <span className="text-white font-medium">{inspectingSubmission.district}</span>
                  </div>
                </div>

                {(inspectingSubmission.address || inspectingSubmission.googleMapsLink) && (
                  <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    {inspectingSubmission.address && (
                      <div className="text-white/80">
                        <strong className="text-brand-gold font-mono">Adresse exacte :</strong> {inspectingSubmission.address}
                      </div>
                    )}
                    {inspectingSubmission.googleMapsLink && (
                      <a
                        href={inspectingSubmission.googleMapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-brand-gold hover:underline font-mono text-[11px] shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Voir sur Google Maps</span>
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Section 3: Caractéristiques du Bien */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-brand-gold font-bold block">
                  🏡 Caractéristiques Techniques
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-[10px] text-white/50 block font-mono">Catégorie</span>
                    <span className="text-white font-bold">{inspectingSubmission.propertyType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/50 block font-mono">Univers Souhaité</span>
                    <span className="bg-brand-gold/15 text-brand-gold px-2 py-0.5 rounded text-[10px] font-mono font-bold inline-block mt-0.5">
                      {inspectingSubmission.objective}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/50 block font-mono">Surface Habitable</span>
                    <span className="text-white font-mono font-bold text-sm">{inspectingSubmission.surfaceM2} m²</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/50 block font-mono">Pièces / Chambres</span>
                    <span className="text-white font-mono font-bold text-sm">{inspectingSubmission.bedrooms || 0}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-white/50">Estimation Financière Souhaitée :</span>
                  <span className="text-base sm:text-lg font-bold font-mono text-brand-gold">
                    {(inspectingSubmission.estimatedPrice || inspectingSubmission.estimatedValue || 0).toLocaleString('fr-FR')} TND
                  </span>
                </div>

                {inspectingSubmission.details && (
                  <div className="pt-2 border-t border-white/5 text-xs text-brand-travertine/80 leading-relaxed bg-black/20 p-3 rounded-lg">
                    <strong className="text-brand-gold font-mono text-[10px] block uppercase mb-1">Description Éditoriale :</strong>
                    {inspectingSubmission.details}
                  </div>
                )}
              </div>

              {/* Section 4: Cadre Juridique & Titre Foncier (Loi Tunisienne) */}
              <div className="p-4 rounded-xl bg-brand-gold/10 border border-brand-gold/30 space-y-3">
                <div className="flex items-center gap-2 text-brand-gold font-bold font-mono text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Statut Juridique & Titre Foncier (Loi Tunisienne)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-lg bg-black/30 border border-white/10 space-y-1">
                    <span className="text-[10px] font-mono text-brand-gold uppercase block">Type de Titre Déclaré</span>
                    <span className="font-semibold text-white text-xs block">
                      {inspectingSubmission.titleType || 'Titre Bleu Individuel (رسم عقاري فردي مسجل)'}
                    </span>
                    {inspectingSubmission.titleNumber && (
                      <span className="text-[11px] font-mono text-brand-gold block">
                        N° Titre CPF (دفتر خانة) : <strong>{inspectingSubmission.titleNumber}</strong>
                      </span>
                    )}
                  </div>

                  <div className="p-3 rounded-lg bg-black/30 border border-white/10 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Certificat de Propriété &lt; 3 mois :</span>
                      <span className="font-bold text-white font-mono">{inspectingSubmission.hasCertificate || 'Non'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Permis de Bâtir Municipal :</span>
                      <span className="font-bold text-white font-mono">{inspectingSubmission.hasBuildingPermit || 'Non'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 font-mono flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Dossier soumis avec engagement sur l'honneur de conformité au Code des Droits Réels (Loi n° 65-5).</span>
                </div>
              </div>

              {/* Section 5: Photos Soumises */}
              {inspectingSubmission.photos && inspectingSubmission.photos.length > 0 && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-brand-gold font-bold block">
                    📷 Visuels Transmis ({inspectingSubmission.photos.length} photos)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {inspectingSubmission.photos.map((photoUrl, idx) => (
                      <a
                        key={idx}
                        href={photoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative aspect-video rounded-xl overflow-hidden border border-white/15 hover:border-brand-gold transition-colors block group"
                      >
                        <img src={photoUrl} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-mono font-bold">
                          Agrandir ↗
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                onClick={() => setInspectingSubmission(null)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-mono transition-colors"
              >
                Fermer l'Aperçu
              </button>

              <div className="flex items-center gap-2.5">
                {inspectingSubmission.status === 'PENDING' && (
                  <button
                    onClick={() => handleRejectSubmission(inspectingSubmission.id, inspectingSubmission.refCode)}
                    className="px-4 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs font-bold transition-colors"
                  >
                    Refuser le Dossier
                  </button>
                )}

                {inspectingSubmission.status === 'PENDING' && (
                  <button
                    onClick={() => handleApproveSubmission(inspectingSubmission)}
                    className="flex-1 sm:flex-initial bg-gradient-to-r from-brand-gold to-brand-gold-dark hover:opacity-95 text-brand-navy font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approuver & Publier au Catalogue</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
