'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  OwnerSubmission,
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
  ArrowLeft,
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
  FileDown,
  RefreshCw,
  Radio,
  Activity,
  Layers,
  Compass,
  MapPin,
  SlidersHorizontal,
  ArrowUpRight,
  Link2,
  Briefcase,
} from 'lucide-react';
import { generateSubmissionPdf } from '@/lib/generateSubmissionPdf';
import { useRealtimeSync, broadcastDataChange } from '@/hooks/useRealtimeSync';


const INITIAL_SUBMISSIONS: OwnerSubmission[] = [];

const INITIAL_RESERVATIONS: BookingRequest[] = [];

const INITIAL_LEADS: Lead[] = [];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, is2FAVerified, logout, hasPermission, logAction, auditLogs, login, verify2FACode } = useAuth();
  const { language } = useLanguage();

  // Admin Direct Login States for Gate Screen
  const [adminLoginEmail, setAdminLoginEmail] = useState('yassinealoulou6@gmail.com');
  const [adminLoginPassword, setAdminLoginPassword] = useState('Yassine.123');
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [adminOtpCode, setAdminOtpCode] = useState('');
  const [adminOtpError, setAdminOtpError] = useState<string | null>(null);
  const [adminRequires2FA, setAdminRequires2FA] = useState(false);

  // Active Tab State
  const [activeTab, setActiveTab] = useState<'kpi' | 'properties' | 'submissions' | 'crm' | 'reservations' | 'articles' | 'users' | 'audit'>('kpi');

  // Functional Data States (Live from DB)
  const [properties, setProperties] = useState<Property[]>([]);
  const [submissions, setSubmissions] = useState<OwnerSubmission[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [reservations, setReservations] = useState<BookingRequest[]>([]);
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [staffUsers, setStaffUsers] = useState<UserAccount[]>([]);
  const [dbStats, setDbStats] = useState<any>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Real-time live sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);

  // Admin Action Toast Notification
  const [adminToast, setAdminToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setAdminToast({ message, type });
    setTimeout(() => setAdminToast(null), 4000);
  };

  // Sync data from live APIs & database
  const loadAdminData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsSyncing(true);
    try {
      const res = await fetch('/api/admin/all');
      const data = await res.json();

      if (data?.success) {
        if (data.stats) setDbStats(data.stats);
        if (Array.isArray(data.properties) && data.properties.length > 0) setProperties(data.properties);
        if (Array.isArray(data.bookings) && data.bookings.length > 0) setReservations(data.bookings);
        if (Array.isArray(data.leads) && data.leads.length > 0) setLeads(data.leads);
        if (Array.isArray(data.users) && data.users.length > 0) setStaffUsers(data.users);
        if (Array.isArray(data.submissions) && data.submissions.length > 0) setSubmissions(data.submissions);
        if (Array.isArray(data.articles) && data.articles.length > 0) setArticles(data.articles);
        setLastSyncTime(new Date());
      }
    } catch (err) {
      console.warn('Admin API load fallback:', err);
    } finally {
      if (!isSilent) setIsSyncing(false);
      setIsInitialLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  // Universal Real-time Live Sync (BroadcastChannel + Supabase + Window Focus)
  useRealtimeSync(() => {
    loadAdminData(true);
  });

  // Background sync interval (every 15 seconds)
  useEffect(() => {
    if (!autoSyncEnabled) return;
    const interval = setInterval(() => {
      loadAdminData(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [autoSyncEnabled, loadAdminData]);

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
  const [propertyCategoryFilter, setPropertyCategoryFilter] = useState<string>('ALL');
  const [propertyStatusFilter, setPropertyStatusFilter] = useState<string>('ALL');
  const [submissionFilter, setSubmissionFilter] = useState<string>('ALL');
  const [submissionSearch, setSubmissionSearch] = useState<string>('');
  const [crmSearch, setCrmSearch] = useState<string>('');
  const [crmStatusFilter, setCrmStatusFilter] = useState<string>('ALL');
  const [reservationSearch, setReservationSearch] = useState<string>('');
  const [reservationStatusFilter, setReservationStatusFilter] = useState<string>('ALL');

  // Interconnected Navigation Helpers ("Everything Connected")
  const jumpToPropertiesWithCategory = (cat: string) => {
    setActiveTab('properties');
    setPropertyCategoryFilter(cat);
  };
  const jumpToPropertiesWithUniverse = (uni: string) => {
    setActiveTab('properties');
    setUniverseFilter(uni);
  };
  const jumpToCrmWithProperty = (propTitle: string) => {
    setActiveTab('crm');
    setCrmSearch(propTitle);
  };
  const jumpToReservationsWithProperty = (propTitle: string) => {
    setActiveTab('reservations');
    setReservationSearch(propTitle);
  };
  const jumpToSubmissionsWithStatus = (st: string) => {
    setActiveTab('submissions');
    setSubmissionFilter(st);
  };
  const jumpToSubmissionsWithOwner = (emailOrPhone: string) => {
    setActiveTab('submissions');
    setSubmissionSearch(emailOrPhone);
  };
  const jumpToReservationsWithGuest = (emailOrPhone: string) => {
    setActiveTab('reservations');
    setReservationSearch(emailOrPhone);
  };
  const jumpToCrmWithLead = (emailOrPhone: string) => {
    setActiveTab('crm');
    setCrmSearch(emailOrPhone);
  };

  // Memoized Filtered Datasets for Fast Rendering & Zero Input Lag
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const pTitle = typeof p.title === 'string' ? p.title : p.title?.fr || '';
      const matchesSearch =
        !propertySearch ||
        pTitle.toLowerCase().includes(propertySearch.toLowerCase()) ||
        p.id.toLowerCase().includes(propertySearch.toLowerCase()) ||
        (p.location?.city || '').toLowerCase().includes(propertySearch.toLowerCase()) ||
        (p.location?.district || '').toLowerCase().includes(propertySearch.toLowerCase());
      const matchesUniverse = universeFilter === 'ALL' || p.universe === universeFilter;
      const matchesCategory = propertyCategoryFilter === 'ALL' || p.category === propertyCategoryFilter;
      const matchesStatus = propertyStatusFilter === 'ALL' || p.status === propertyStatusFilter;
      return matchesSearch && matchesUniverse && matchesCategory && matchesStatus;
    });
  }, [properties, propertySearch, universeFilter, propertyCategoryFilter, propertyStatusFilter]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const matchesFilter = submissionFilter === 'ALL' || s.status === submissionFilter;
      const matchesSearch =
        !submissionSearch ||
        (s.refCode || '').toLowerCase().includes(submissionSearch.toLowerCase()) ||
        (s.ownerName || '').toLowerCase().includes(submissionSearch.toLowerCase()) ||
        (s.ownerPhone || '').includes(submissionSearch) ||
        (s.ownerEmail || '').toLowerCase().includes(submissionSearch.toLowerCase()) ||
        (s.city || '').toLowerCase().includes(submissionSearch.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [submissions, submissionFilter, submissionSearch]);

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchesStatus = crmStatusFilter === 'ALL' || l.status === crmStatusFilter;
      const matchesSearch =
        !crmSearch ||
        (l.name || '').toLowerCase().includes(crmSearch.toLowerCase()) ||
        (l.phone || '').includes(crmSearch) ||
        (l.email || '').toLowerCase().includes(crmSearch.toLowerCase()) ||
        (l.propertyTitle || '').toLowerCase().includes(crmSearch.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [leads, crmStatusFilter, crmSearch]);

  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      const matchesStatus = reservationStatusFilter === 'ALL' || r.status === reservationStatusFilter;
      const matchesSearch =
        !reservationSearch ||
        (r.guestName || '').toLowerCase().includes(reservationSearch.toLowerCase()) ||
        (r.guestPhone || '').includes(reservationSearch) ||
        (r.guestEmail || '').toLowerCase().includes(reservationSearch.toLowerCase()) ||
        (r.propertyTitle || '').toLowerCase().includes(reservationSearch.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [reservations, reservationStatusFilter, reservationSearch]);

  const filteredStaffUsers = useMemo(() => {
    return staffUsers.filter((u) => {
      const isStaff = u.role !== 'CLIENT';
      const matchesRoleFilter =
        accountRoleFilter === 'ALL'
          ? true
          : accountRoleFilter === 'STAFF'
          ? isStaff
          : u.role === 'CLIENT';
      const matchesSearch =
        !accountSearchQuery ||
        (u.name || '').toLowerCase().includes(accountSearchQuery.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(accountSearchQuery.toLowerCase()) ||
        (u.phone && u.phone.includes(accountSearchQuery));
      return matchesRoleFilter && matchesSearch;
    });
  }, [staffUsers, accountRoleFilter, accountSearchQuery]);

  // Modal States
  const [propertyModalOpen, setPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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
  // Spécifiques Villa Semi-Construite & Commercial
  const [propCompletionEstimate, setPropCompletionEstimate] = useState<number | undefined>(undefined);
  const [propConstructionStage, setPropConstructionStage] = useState('');
  const [propBusinessActivity, setPropBusinessActivity] = useState('');
  const [propMonthlyRent, setPropMonthlyRent] = useState<number | undefined>(undefined);
  const [propCommercialSurface, setPropCommercialSurface] = useState<number | undefined>(undefined);
  const [propLinearFacade, setPropLinearFacade] = useState<number | undefined>(undefined);

  // --------------------------------------------------------------------------
  // OWNER SUBMISSION APPROVAL & CONVERSION
  // --------------------------------------------------------------------------
  const handleApproveSubmission = async (sub: OwnerSubmission, publishToCatalog: boolean = false) => {
    if (publishToCatalog) {
      const imagesList = sub.photos && sub.photos.length > 0
        ? sub.photos.map((url, idx) => ({ url, alt: `${sub.propertyType} Photo ${idx + 1}`, isCover: idx === 0 }))
        : [{ url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85', alt: sub.propertyType, isCover: true }];

      const newProp: Property = {
        id: `vr-prop-${Date.now()}`,
        title: { fr: `${sub.propertyType} High Standing — ${sub.district || sub.city}`, ar: `${sub.propertyType} — ${sub.district || sub.city}`, en: `${sub.propertyType} — ${sub.district || sub.city}` },
        universe: sub.objective,
        category: sub.propertyType,
        price: { amount: sub.estimatedPrice || sub.estimatedValue || 0, currency: 'TND', period: 'total' },
        location: { city: sub.city, district: sub.district || sub.city, country: 'Tunisie', lat: 34.7400, lng: 10.7400, isExactPosition: false },
        specs: {
          surfaceM2: sub.surfaceM2,
          bedrooms: sub.bedrooms || 0,
          pool: true,
          garden: true,
          completionEstimate: sub.completionEstimate || sub.specificDetails?.completionEstimate,
          constructionStage: sub.constructionStage || sub.specificDetails?.constructionStage,
          businessActivity: sub.businessActivity || sub.specificDetails?.businessActivity,
          commercialSurfaceM2: sub.commercialSurfaceM2 || sub.specificDetails?.commercialSurfaceM2,
          monthlyRentTND: sub.monthlyRentTND || sub.specificDetails?.monthlyRentTND,
        },
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
      setSubmissions((prev) => prev.map((s) => (s.id === sub.id ? { ...s, status: 'APPROVED', isPublished: true } : s)));
      if (inspectingSubmission?.id === sub.id) {
        setInspectingSubmission({ ...sub, status: 'APPROVED', isPublished: true });
      }

      try {
        await fetch('/api/submissions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: sub.id, status: 'APPROVED', isPublished: true }),
        });
        await fetch('/api/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProp),
        });
        loadAdminData(true);
        showToast(`Dossier ${sub.refCode} approuvé et publié au catalogue !`);
      } catch (e) {
        console.warn('Submission approval API sync fallback:', e);
      }

      logAction('Approbation & publication dossier', sub.refCode);
      setActiveTab('properties');
    } else {
      // APPROUVER SANS PUBLIER (Dossier mandat validé en interne, hors catalogue)
      setSubmissions((prev) => prev.map((s) => (s.id === sub.id ? { ...s, status: 'APPROVED', isPublished: false } : s)));
      if (inspectingSubmission?.id === sub.id) {
        setInspectingSubmission({ ...sub, status: 'APPROVED', isPublished: false });
      }

      try {
        await fetch('/api/submissions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: sub.id, status: 'APPROVED', isPublished: false }),
        });
        loadAdminData(true);
        showToast(`Dossier ${sub.refCode} approuvé en interne (Non publié au catalogue) !`, 'success');
      } catch (e) {
        console.warn('Submission internal approval fallback:', e);
      }

      logAction('Approbation dossier sans publication', sub.refCode);
    }
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
      loadAdminData(true);
      showToast(`Dossier ${refCode} refusé`, 'info');
    } catch (e) {
      console.warn('Submission reject API sync fallback:', e);
    }
    logAction('Refus dossier propriétaire', refCode);
  };

  // Cross-entity: Generate CRM Lead from Submission
  const handleCreateLeadFromSubmission = async (sub: OwnerSubmission) => {
    const existing = leads.find((l) => l.phone === sub.ownerPhone || (sub.ownerEmail && l.email === sub.ownerEmail));
    if (existing) {
      jumpToCrmWithLead(existing.email || existing.phone);
      showToast('Ce propriétaire dispose déjà d’une fiche active dans le CRM.', 'info');
      return;
    }

    const newLead: Lead = {
      id: `lead-sub-${Date.now()}`,
      name: sub.ownerName,
      phone: sub.ownerPhone,
      email: sub.ownerEmail,
      status: 'Nouveau',
      assignedAgent: user?.name || 'Staff Villa Regia',
      universe: sub.objective,
      propertyTitle: `${sub.propertyType} — ${sub.district || sub.city} (${sub.refCode})`,
      source: 'Soumission Propriétaire',
      notes: `Dossier Mandat ${sub.refCode}. Valeur estimée: ${(sub.estimatedPrice || sub.estimatedValue || 0).toLocaleString()} TND. Surface: ${sub.surfaceM2}m². Vocation: ${sub.propertyType} à ${sub.city}. Détails: ${sub.details || 'N/A'}`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setLeads((prev) => [newLead, ...prev]);
    try {
      await fetch('/api/admin/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead),
      });
      loadAdminData(true);
      showToast(`Fiche prospect CRM créée avec succès pour ${sub.ownerName} !`, 'success');
      jumpToCrmWithLead(sub.ownerEmail || sub.ownerPhone);
    } catch (e) {
      console.warn('Lead creation error:', e);
    }
  };

  // Cross-entity: Generate CRM Lead from Reservation
  const handleCreateLeadFromReservation = async (res: BookingRequest) => {
    const existing = leads.find((l) => l.phone === res.guestPhone || l.email === res.guestEmail);
    if (existing) {
      jumpToCrmWithLead(existing.email || existing.phone);
      showToast('Ce voyageur dispose déjà d’un dossier dans le CRM.', 'info');
      return;
    }

    const newLead: Lead = {
      id: `lead-res-${Date.now()}`,
      name: res.guestName,
      phone: res.guestPhone,
      email: res.guestEmail,
      status: 'Nouveau',
      assignedAgent: user?.name || 'Staff Villa Regia',
      universe: 'LUXE',
      propertyTitle: res.propertyTitle,
      source: 'Réservation',
      notes: `Séjour du ${res.checkIn} au ${res.checkOut} (${res.guestsCount} pers). Acompte: ${res.depositAmount || 0} TND. Statut: ${res.status}.`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setLeads((prev) => [newLead, ...prev]);
    try {
      await fetch('/api/admin/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead),
      });
      loadAdminData(true);
      showToast(`Fiche client CRM créée pour ${res.guestName} !`, 'success');
      jumpToCrmWithLead(res.guestEmail || res.guestPhone);
    } catch (e) {
      console.warn('Lead creation error:', e);
    }
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
    setPropCompletionEstimate(undefined);
    setPropConstructionStage('');
    setPropBusinessActivity('');
    setPropMonthlyRent(undefined);
    setPropCommercialSurface(undefined);
    setPropLinearFacade(undefined);
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
    setPropCompletionEstimate(p.specs.completionEstimate);
    setPropConstructionStage(p.specs.constructionStage || '');
    setPropBusinessActivity(p.specs.businessActivity || '');
    setPropMonthlyRent(p.specs.monthlyRentTND);
    setPropCommercialSurface(p.specs.commercialSurfaceM2);
    setPropLinearFacade(p.specs.linearFacadeMeters);
    setPropertyModalOpen(true);
  };

  const handleSaveProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('properties.update') && !hasPermission('properties.create')) {
      alert('Permission refusée');
      return;
    }

    if (!propTitle.trim()) {
      showToast('Le titre de la propriété est obligatoire.', 'error');
      return;
    }
    if (!propPrice || Number(propPrice) <= 0) {
      showToast('Le montant du prix doit être strictement supérieur à 0.', 'error');
      return;
    }
    if (!propCity.trim()) {
      showToast('La ville est obligatoire.', 'error');
      return;
    }

    if (editingProperty) {
      setProperties((prev) =>
        prev.map((item) => {
          if (item.id === editingProperty.id) {
            const updatedProp: Property = {
              ...item,
              title: { fr: propTitle, ar: propTitle, en: propTitle },
              universe: propUniverse,
              category: propCategory,
              price: { ...item.price, amount: Number(propPrice) },
              location: { ...item.location, city: propCity, district: propDistrict },
              specs: {
                ...item.specs,
                surfaceM2: Number(propSurface),
                bedrooms: Number(propBedrooms),
                completionEstimate: propCompletionEstimate,
                constructionStage: propConstructionStage || undefined,
                businessActivity: propBusinessActivity || undefined,
                monthlyRentTND: propMonthlyRent,
                commercialSurfaceM2: propCommercialSurface,
                linearFacadeMeters: propLinearFacade,
              },
              description: { fr: propDesc, ar: propDesc, en: propDesc },
              images: [{ url: propImageUrl, alt: propTitle, isCover: true }],
              updatedAt: new Date().toISOString().split('T')[0],
            };
            fetch(`/api/properties/${editingProperty.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedProp),
            }).then(() => {
              loadAdminData(true);
              showToast('Propriété mise à jour avec succès dans la base de données');
            }).catch(err => console.warn('Property update error:', err));
            return updatedProp;
          }
          return item;
        })
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
        specs: {
          surfaceM2: Number(propSurface),
          bedrooms: Number(propBedrooms),
          pool: true,
          garden: true,
          completionEstimate: propCompletionEstimate,
          constructionStage: propConstructionStage || undefined,
          businessActivity: propBusinessActivity || undefined,
          monthlyRentTND: propMonthlyRent,
          commercialSurfaceM2: propCommercialSurface,
          linearFacadeMeters: propLinearFacade,
        },
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
      fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProp),
      }).then(() => {
        loadAdminData(true);
        showToast('Nouvelle propriété créée et synchronisée avec succès');
      }).catch(err => console.warn('Property create error:', err));
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
      fetch(`/api/properties/${id}`, {
        method: 'DELETE',
      }).then(() => {
        loadAdminData(true);
        showToast(`Propriété "${title}" supprimée de la base`, 'info');
      }).catch(err => console.warn('Property delete error:', err));
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
    fetch(`/api/properties/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    }).then(() => {
      loadAdminData(true);
      showToast(`Statut de "${title}" modifié en ${nextStatus}`);
    }).catch(err => console.warn('Property status update error:', err));
  };

  const handleToggleFeatured = (id: string, isFeatured: boolean, title: string) => {
    setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, isFeatured: !isFeatured } : p)));
    logAction(`Mis en Une (${!isFeatured})`, title);
    fetch(`/api/properties/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFeatured: !isFeatured }),
    }).then(() => {
      loadAdminData(true);
      showToast(`Propriété "${title}" ${!isFeatured ? 'mise en Une' : 'retirée de la Une'}`);
    }).catch(err => console.warn('Property featured toggle error:', err));
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
    fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dup),
    }).then(() => loadAdminData(true)).catch(err => console.warn('Property duplicate error:', err));
  };

  const handleCreateLeadFromProperty = (p: Property) => {
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: 'Client Intéressé',
      phone: '+216 27 745 403',
      email: 'client@villaregia.tn',
      source: 'Demande Visite',
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
    fetch('/api/admin/crm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLead),
    }).then(() => loadAdminData(true)).catch(err => console.warn('Lead create error:', err));
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
    fetch('/api/admin/crm', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: activeLead.id,
        status: leadStatusInput,
        notes: leadNoteInput,
        assignedAgent: leadAgentInput,
      }),
    }).then(() => {
      loadAdminData(true);
      showToast(`Lead "${activeLead.name}" mis à jour avec succès`);
    }).catch(err => console.warn('Lead update error:', err));
  };

  const handleCreateNewLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName.trim()) {
      showToast('Le nom du client est obligatoire.', 'error');
      return;
    }
    if (!newLeadPhone.trim()) {
      showToast('Le numéro de téléphone du client est obligatoire.', 'error');
      return;
    }

    const created: Lead = {
      id: `lead-${Date.now()}`,
      name: newLeadName.trim(),
      phone: newLeadPhone.trim(),
      email: newLeadEmail.trim() || 'client@villaregia.tn',
      source: 'Formulaire Contact',
      universe: newLeadUniverse,
      propertyTitle: newLeadPropTitle.trim() || 'Demande Générale',
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
    fetch('/api/admin/crm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(created),
    }).then(() => {
      loadAdminData(true);
      showToast(`Nouveau prospect "${created.name}" créé dans le CRM`);
    }).catch(err => console.warn('Lead create error:', err));
  };

  const handleDeleteLead = (id: string, name: string) => {
    if (confirm(`Supprimer le lead commercial de ${name} ?`)) {
      setLeads((prev) => prev.filter((l) => l.id !== id));
      logAction('Suppression lead', name);
      fetch(`/api/admin/crm?id=${id}`, {
        method: 'DELETE',
      }).then(() => {
        loadAdminData(true);
        showToast(`Lead "${name}" supprimé`, 'info');
      }).catch(err => console.warn('Lead delete error:', err));
    }
  };

  const handleUpdateSubmissionStatus = async (subId: string, status: OwnerSubmission['status']) => {
    setSubmissions((prev) => prev.map((s) => (s.id === subId ? { ...s, status } : s)));
    if (inspectingSubmission?.id === subId) {
      setInspectingSubmission((prev) => prev ? { ...prev, status } : null);
    }
    logAction(`Mise à jour statut dossier (${status})`, subId);
    try {
      await fetch('/api/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: subId, status }),
      });
      loadAdminData(true);
      showToast(`Statut du dossier mis à jour (${status})`);
    } catch (e) {
      console.warn('Submission status update error:', e);
    }
  };

  // --------------------------------------------------------------------------
  // RESERVATION FUNCTIONS
  // --------------------------------------------------------------------------
  const handleUpdateReservationStatus = (id: string, status: 'CONFIRMED' | 'CANCELLED' | 'PENDING') => {
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    logAction(`Statut réservation (${status})`, id);
    fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).then(() => {
      loadAdminData(true);
      showToast(`Réservation mise à jour (${status})`);
    }).catch(err => console.warn('Booking status update error:', err));
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
    if (!artTitle.trim()) {
      showToast('Le titre de l\'article est obligatoire.', 'error');
      return;
    }
    if (!artContent.trim()) {
      showToast('Le contenu de l\'article est obligatoire.', 'error');
      return;
    }

    const titleObj = { fr: artTitle.trim(), ar: artTitle.trim(), en: artTitle.trim() };
    const excerptObj = { fr: artExcerpt.trim() || artContent.slice(0, 150), ar: artExcerpt.trim() || artContent.slice(0, 150), en: artExcerpt.trim() || artContent.slice(0, 150) };
    const contentObj = { fr: artContent.trim(), ar: artContent.trim(), en: artContent.trim() };

    if (editingArticle) {
      const updatedArticle: BlogPost = {
        ...editingArticle,
        title: titleObj,
        category: artCategory,
        excerpt: excerptObj,
        content: contentObj,
        readTime: artReadTime,
        coverImage: artCoverImage,
      };

      setArticles((prev) =>
        prev.map((a) => (a.id === editingArticle.id ? updatedArticle : a))
      );
      logAction('Modification article', artTitle);

      fetch(`/api/articles/${editingArticle.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedArticle),
      }).then(() => {
        loadAdminData(true);
        showToast('Article du journal mis à jour');
      }).catch(err => console.warn('Article update API fallback:', err));
    } else {
      const generatedSlug = artTitle
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const newArt: BlogPost = {
        id: `art-${Date.now()}`,
        slug: generatedSlug || `art-${Date.now()}`,
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

      fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newArt),
      }).then(() => {
        loadAdminData(true);
        showToast('Nouvel article publié dans le journal');
      }).catch(err => console.warn('Article create API fallback:', err));
    }
    setArticleModalOpen(false);
  };

  const handleDeleteArticle = (id: string, title: string) => {
    if (confirm(`Supprimer l'article "${title}" ?`)) {
      const art = articles.find(a => a.id === id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
      logAction('Suppression article', title);

      if (art) {
        fetch(`/api/articles/${art.slug}`, {
          method: 'DELETE',
        }).then(() => {
          loadAdminData(true);
          showToast(`Article "${title}" supprimé`, 'info');
        }).catch(err => console.warn('Article delete API fallback:', err));
      }
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
        showToast(`Compte de "${newUserName}" mis à jour`);
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
        showToast(`Collaborateur "${newUserName}" ajouté avec succès`);
      }

      setUserModalOpen(false);
      await loadAdminData(true);
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
      showToast(`Rôle de "${userName}" modifié en ${newRole}`);
      await loadAdminData(true);
    } catch {}
    logAction(`Rôle modifié (${newRole})`, userName);
  };

  const handleDeleteStaffUser = async (userId: string, userName: string, userEmail: string) => {
    if (confirm(`Révoquer et supprimer définitivement le compte staff de ${userName} (${userEmail}) ?`)) {
      try {
        await fetch(`/api/admin/users?email=${encodeURIComponent(userEmail)}&id=${userId}`, {
          method: 'DELETE',
        });
        showToast(`Compte de "${userName}" révoqué`, 'info');
        await loadAdminData(true);
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
      <div className="pt-24 pb-24 bg-brand-navy min-h-screen text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 glass-navy p-8 sm:p-10 rounded-2xl max-w-lg w-full border border-brand-gold/30 shadow-2xl space-y-6">
          
          <div className="text-center space-y-3">
            <div className="relative w-44 h-11 mx-auto">
              <Image src="/images/logo-light.png" alt="Villa Regia" fill className="object-contain" />
            </div>

            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-brand-gold bg-brand-gold/10 px-3.5 py-1.5 rounded border border-brand-gold/20 inline-block font-bold">
              Portail Direction & Administration
            </span>

            <h1 className="font-editorial text-2xl sm:text-3xl font-light text-brand-travertine">
              Connexion Espace Privé
            </h1>
          </div>

          {adminLoginError && (
            <div className="p-3.5 rounded-xl bg-red-500/20 text-red-300 text-xs border border-red-500/30 font-mono flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{adminLoginError}</span>
            </div>
          )}

          {adminOtpError && (
            <div className="p-3.5 rounded-xl bg-red-500/20 text-red-300 text-xs border border-red-500/30 font-mono flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{adminOtpError}</span>
            </div>
          )}

          {adminRequires2FA ? (
            /* 2FA CODE FORM */
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setAdminOtpError(null);
                const valid = verify2FACode(adminOtpCode.trim());
                if (!valid) {
                  setAdminOtpError('Code 2FA incorrect. Veuillez vérifier le code reçu par email.');
                }
              }}
              className="space-y-4"
            >
              <div className="text-center space-y-1">
                <span className="text-xs text-brand-gold font-mono block">Code 2FA envoyé à votre email</span>
                <p className="text-[11px] text-brand-travertine/60">Saisissez les 6 chiffres pour valider l'accès.</p>
              </div>

              <input
                type="text"
                maxLength={6}
                value={adminOtpCode}
                onChange={(e) => setAdminOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full bg-brand-navy border border-brand-gold/40 rounded-xl py-3 text-center font-mono text-2xl tracking-widest text-brand-gold focus:border-brand-gold focus:outline-none"
                required
              />

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-navy font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow hover:opacity-95 transition-all"
              >
                Valider l'Accès Administrateur
              </button>
            </form>
          ) : (
            /* DIRECT LOGIN FORM */
            <div className="space-y-4">
              {/* One-Click Quick Login Button */}
              <button
                type="button"
                onClick={async () => {
                  setAdminLoginError(null);
                  setAdminLoginLoading(true);
                  const res = await login('yassinealoulou6@gmail.com', 'Yassine.123');
                  setAdminLoginLoading(false);
                  if (res.success && res.requires2FA) {
                    setAdminRequires2FA(true);
                  } else if (!res.success) {
                    setAdminLoginError(res.error || 'Erreur lors de la connexion.');
                  }
                }}
                disabled={adminLoginLoading}
                className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 py-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>1-Click : Connexion Super Admin (Yassine Aloulou)</span>
              </button>

              <div className="flex items-center gap-3 text-white/30 text-[10px] font-mono uppercase tracking-wider">
                <div className="flex-1 h-px bg-white/10" />
                <span>Ou saisir vos identifiants</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setAdminLoginError(null);
                  if (!adminLoginEmail || !adminLoginPassword) {
                    setAdminLoginError('Veuillez renseigner votre email et mot de passe.');
                    return;
                  }
                  setAdminLoginLoading(true);
                  const res = await login(adminLoginEmail, adminLoginPassword);
                  setAdminLoginLoading(false);
                  if (res.success && res.requires2FA) {
                    setAdminRequires2FA(true);
                  } else if (!res.success) {
                    setAdminLoginError(res.error || 'Identifiants incorrects.');
                  }
                }}
                className="space-y-3.5"
              >
                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">
                    Adresse Email Staff
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={adminLoginEmail}
                      onChange={(e) => setAdminLoginEmail(e.target.value)}
                      placeholder="nom@villaregiarealestates.com"
                      className="w-full bg-brand-navy border border-white/20 rounded-xl px-4 py-2.5 pl-10 text-xs text-white focus:border-brand-gold focus:outline-none font-mono"
                      required
                    />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold/60" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={adminLoginPassword}
                      onChange={(e) => setAdminLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-brand-navy border border-white/20 rounded-xl px-4 py-2.5 pl-10 text-xs text-white focus:border-brand-gold focus:outline-none font-mono"
                      required
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold/60" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={adminLoginLoading}
                  className="w-full bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-navy font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {adminLoginLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  <span>{adminLoginLoading ? 'Connexion en cours...' : 'Déverrouiller le Tableau de Bord'}</span>
                </button>
              </form>
            </div>
          )}

          <div className="text-center pt-2 border-t border-white/10">
            <Link href="/" className="inline-flex items-center gap-2 text-xs text-brand-travertine/60 hover:text-brand-gold transition-colors font-mono">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retourner au site public Villa Regia</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // INTERCONNECTED REAL-TIME AGGREGATED METRICS
  // --------------------------------------------------------------------------
  const totalCatalogValue = properties.reduce((sum, p) => sum + (p.price.amount || 0), 0);
  const totalSubmissionsValue = submissions.reduce((sum, s) => sum + (s.estimatedPrice || s.estimatedValue || 0), 0);
  const totalPortfolioValue = totalCatalogValue + totalSubmissionsValue;

  const semiConstructedProperties = properties.filter((p) => p.category === 'Villa Semi-Construite');
  const totalCompletionBudget = semiConstructedProperties.reduce((sum, p) => sum + (p.specs.completionEstimate || 0), 0);

  const commercialProperties = properties.filter((p) => p.category === 'Espace Commercial' || p.category === 'Fonds de Commerce');
  const totalMonthlyWallRent = commercialProperties.reduce((sum, p) => sum + (p.specs.monthlyRentTND || 0), 0);

  const totalBookingsDeposit = reservations.reduce((sum, r) => sum + (r.depositAmount || 0), 0);
  const confirmedBookingsCount = reservations.filter((r) => r.status === 'CONFIRMED').length;

  const pendingSubmissionsCount = submissions.filter((s) => s.status === 'PENDING').length;
  const approvedUnpublishedCount = submissions.filter((s) => s.status === 'APPROVED' && !s.isPublished).length;
  const approvedPublishedCount = submissions.filter((s) => s.status === 'APPROVED' && s.isPublished).length;

  const activeLeadsCount = leads.filter((l) => l.status === 'Visite' || l.status === 'Offre' || l.status === 'Conclu').length;
  const newLeadsCount = leads.filter((l) => l.status === 'Nouveau').length;

  const totalClientsCount = staffUsers.filter((u) => u.role === 'CLIENT').length;
  const totalStaffCount = staffUsers.filter((u) => u.role !== 'CLIENT').length;

  // Filtered collections are memoized via useMemo above


  return (
    <div className="pt-24 pb-24 bg-brand-navy-dark min-h-screen text-brand-travertine relative">
      
      {/* Real-time Action Feedback Toast */}
      {adminToast && (
        <div className="fixed top-24 right-6 z-[9999] transition-all">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md text-xs font-mono animate-in fade-in slide-in-from-top-3 ${
            adminToast.type === 'error'
              ? 'bg-red-950/95 text-red-200 border-red-500/50 shadow-red-900/40'
              : adminToast.type === 'info'
              ? 'bg-sky-950/95 text-sky-200 border-sky-500/50 shadow-sky-900/40'
              : 'bg-emerald-950/95 text-emerald-200 border-emerald-500/50 shadow-emerald-900/40'
          }`}>
            <span className="w-2 h-2 rounded-full bg-current animate-ping shrink-0" />
            <span>{adminToast.message}</span>
            <button onClick={() => setAdminToast(null)} className="opacity-60 hover:opacity-100 ml-2">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
      
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

            <div className="flex items-center gap-2 shrink-0">
              {/* Real-time Status Badge */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-mono">
                <span className="relative flex h-2 w-2">
                  {autoSyncEnabled && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${autoSyncEnabled ? 'bg-emerald-500' : 'bg-white/40'}`}></span>
                </span>
                <span className="text-white/80">
                  {isSyncing ? 'Synchronisation...' : autoSyncEnabled ? 'En Direct' : 'En Pause'}
                </span>
                <span className="text-white/40 text-[10px]">
                  {lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>

              {/* Supabase Integration Status Badge */}
              <div
                className={`px-2.5 py-1 rounded-xl border text-[10px] font-mono transition-all flex items-center gap-1.5 ${
                  dbStats?.isSupabaseConfigured
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-brand-gold/10 border-brand-gold/30 text-brand-gold'
                }`}
                title={
                  dbStats?.isSupabaseConfigured
                    ? 'Supabase Cloud Connecté : Base PostgreSQL & Storage actifs'
                    : 'Stockage Résilient Actif : Upload d\'images & CRUD UI 100% fonctionnels'
                }
              >
                <div className={`w-2 h-2 rounded-full ${dbStats?.isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-400'}`} />
                <span className="hidden sm:inline font-bold">
                  {dbStats?.isSupabaseConfigured ? 'Supabase Cloud' : 'DB & Storage Actifs'}
                </span>
              </div>

              {/* Manual Sync Button */}
              <button
                onClick={() => loadAdminData(false)}
                disabled={isSyncing}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-brand-gold/15 hover:bg-brand-gold/25 text-brand-gold border border-brand-gold/30 transition-all flex items-center gap-1.5 text-xs font-mono disabled:opacity-50 shadow-sm"
                title="Actualiser les données immédiatement"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualiser</span>
              </button>

              {/* Auto-Sync Toggle Button */}
              <button
                onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
                className={`p-2 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-mono transition-all hidden sm:flex items-center gap-1 ${
                  autoSyncEnabled
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                    : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                }`}
                title={autoSyncEnabled ? 'Désactiver la synchro automatique (8s)' : 'Activer la synchro automatique (8s)'}
              >
                <Radio className={`w-3 h-3 ${autoSyncEnabled ? 'text-emerald-400 animate-pulse' : ''}`} />
                <span className="text-[10px]">{autoSyncEnabled ? 'Auto-Sync: ON' : 'Auto-Sync: OFF'}</span>
              </button>

              <button
                onClick={logout}
                className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-brand-travertine/60 hover:text-red-400 border border-white/10 transition-colors shrink-0 flex items-center gap-1.5 text-xs"
                title="Se déconnecter"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline font-mono">Quitter</span>
              </button>
            </div>
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
        
        {/* TAB 1: EXECUTIVE INTELLIGENCE & INTERCONNECTED COCKPIT */}
        {activeTab === 'kpi' && (
          <div className="space-y-8 animate-fade-in">
            {/* 1. Primary Portfolio Valuation & Performance Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Card 1: Total Portfolio Value */}
              <div className="glass-card p-5 sm:p-6 rounded-2xl border border-brand-gold/30 relative overflow-hidden group hover:border-brand-gold/60 transition-all shadow-xl">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-gold/10 rounded-full blur-2xl group-hover:bg-brand-gold/20 transition-all" />
                <span className="text-[10px] font-mono font-bold text-brand-gold uppercase tracking-wider block">
                  Valeur Globale du Patrimoine
                </span>
                <div className="text-3xl sm:text-4xl font-bold text-white font-editorial mt-2 flex items-baseline justify-between">
                  <span>{(totalPortfolioValue / 1000000).toFixed(2)}M <span className="text-sm font-mono text-brand-gold font-normal">TND</span></span>
                  <TrendingUp className="w-5 h-5 text-brand-gold shrink-0" />
                </div>
                <div className="mt-3 pt-3 border-t border-white/10 text-[11px] font-mono text-brand-travertine/70 flex items-center justify-between">
                  <span>Catalogue : {(totalCatalogValue / 1000000).toFixed(1)}M</span>
                  <span className="text-brand-gold">Mandats : {(totalSubmissionsValue / 1000000).toFixed(1)}M</span>
                </div>
              </div>

              {/* Card 2: Active Properties */}
              <div 
                onClick={() => setActiveTab('properties')}
                className="glass-card p-5 sm:p-6 rounded-2xl border border-white/15 relative overflow-hidden group hover:border-brand-gold/50 cursor-pointer transition-all shadow-xl"
              >
                <span className="text-[10px] font-mono font-bold text-brand-travertine/70 uppercase tracking-wider block">
                  Catalogue & Actifs en Ligne
                </span>
                <div className="text-3xl sm:text-4xl font-bold text-white font-editorial mt-2 flex items-baseline justify-between">
                  <span>{properties.length} <span className="text-sm font-mono text-brand-travertine/60 font-normal">biens</span></span>
                  <Building2 className="w-5 h-5 text-brand-gold shrink-0" />
                </div>
                <div className="mt-3 pt-3 border-t border-white/10 text-[11px] font-mono flex items-center justify-between">
                  <span className="text-emerald-400 font-bold">{properties.filter(p => p.status === 'DISPONIBLE').length} Disponibles</span>
                  <span className="text-amber-300">{properties.filter(p => p.isFeatured).length} En Vedette</span>
                </div>
              </div>

              {/* Card 3: Submissions Flow */}
              <div 
                onClick={() => setActiveTab('submissions')}
                className="glass-card p-5 sm:p-6 rounded-2xl border border-white/15 relative overflow-hidden group hover:border-brand-gold/50 cursor-pointer transition-all shadow-xl"
              >
                <span className="text-[10px] font-mono font-bold text-brand-travertine/70 uppercase tracking-wider block">
                  Dossiers Mandats Propriétaires
                </span>
                <div className="text-3xl sm:text-4xl font-bold text-white font-editorial mt-2 flex items-baseline justify-between">
                  <span>{submissions.length} <span className="text-sm font-mono text-brand-travertine/60 font-normal">dossiers</span></span>
                  <FileCheck className="w-5 h-5 text-brand-gold shrink-0" />
                </div>
                <div className="mt-3 pt-3 border-t border-white/10 text-[11px] font-mono flex items-center justify-between">
                  <span className="text-amber-400 font-bold">{pendingSubmissionsCount} À expertiser</span>
                  <span className="text-sky-300 font-bold">{approvedUnpublishedCount} Mandats privés</span>
                </div>
              </div>

              {/* Card 4: CRM Pipeline & Booking Deposits */}
              <div 
                onClick={() => setActiveTab('crm')}
                className="glass-card p-5 sm:p-6 rounded-2xl border border-white/15 relative overflow-hidden group hover:border-brand-gold/50 cursor-pointer transition-all shadow-xl"
              >
                <span className="text-[10px] font-mono font-bold text-brand-travertine/70 uppercase tracking-wider block">
                  CRM & Trésorerie Séjours
                </span>
                <div className="text-3xl sm:text-4xl font-bold text-white font-editorial mt-2 flex items-baseline justify-between">
                  <span>{leads.length} <span className="text-sm font-mono text-brand-travertine/60 font-normal">leads</span></span>
                  <Users className="w-5 h-5 text-emerald-400 shrink-0" />
                </div>
                <div className="mt-3 pt-3 border-t border-white/10 text-[11px] font-mono flex items-center justify-between">
                  <span className="text-emerald-400 font-bold">{activeLeadsCount} En négociation</span>
                  <span className="text-brand-gold font-bold">{totalBookingsDeposit.toLocaleString('fr-TN')} TND acomptes</span>
                </div>
              </div>
            </div>

            {/* 2. Interactive Asset Typology & Business Breakdown */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-brand-gold flex items-center gap-2">
                    <Layers className="w-4 h-4 text-brand-gold" />
                    <span>Répartition Métiers & Typologie Immobilière (Connecté en Direct)</span>
                  </h2>
                  <p className="text-xs text-brand-travertine/60 mt-0.5">
                    Cliquez sur une catégorie pour filtrer instantanément le portefeuille correspondant.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Typology 1: Villas de Prestige */}
                <div 
                  onClick={() => jumpToPropertiesWithCategory('Villa')}
                  className="glass-navy p-5 rounded-xl border border-white/10 hover:border-brand-gold/50 cursor-pointer transition-all space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider group-hover:text-brand-gold transition-colors">
                      🏛️ Demeures & Villas de Prestige
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-brand-gold/15 text-brand-gold px-2 py-0.5 rounded border border-brand-gold/30">
                      {properties.filter(p => p.category === 'Villa' || p.category === 'Maison de Charme').length} Biens
                    </span>
                  </div>
                  <div className="text-xs text-brand-travertine/70 font-mono">
                    Valeur estimée : {(properties.filter(p => p.category === 'Villa' || p.category === 'Maison de Charme').reduce((s, p) => s + (p.price.amount || 0), 0) / 1000000).toFixed(1)}M TND
                  </div>
                  <div className="text-[10px] font-mono text-brand-gold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Explorer les villas</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>

                {/* Typology 2: Villas Semi-Construites */}
                <div 
                  onClick={() => jumpToPropertiesWithCategory('Villa Semi-Construite')}
                  className="glass-navy p-5 rounded-xl border border-amber-500/30 hover:border-amber-400 cursor-pointer transition-all space-y-3 group bg-amber-950/10"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider group-hover:text-white transition-colors">
                      🏗️ Villas Semi-Construites
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
                      {semiConstructedProperties.length} Chantiers
                    </span>
                  </div>
                  <div className="text-xs text-amber-200/80 font-mono">
                    Budget travaux achèvement : {totalCompletionBudget.toLocaleString('fr-TN')} TND
                  </div>
                  <div className="text-[10px] font-mono text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Voir les opportunités chantiers</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>

                {/* Typology 3: Commerces & Fonds de Commerce */}
                <div 
                  onClick={() => jumpToPropertiesWithCategory('Espace Commercial')}
                  className="glass-navy p-5 rounded-xl border border-sky-500/30 hover:border-sky-400 cursor-pointer transition-all space-y-3 group bg-sky-950/10"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-300 uppercase tracking-wider group-hover:text-white transition-colors">
                      🏪 Commerces & Fonds de Commerce
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded border border-sky-500/40">
                      {commercialProperties.length} Actifs
                    </span>
                  </div>
                  <div className="text-xs text-sky-200/80 font-mono">
                    Loyers murs prévisionnels : {totalMonthlyWallRent.toLocaleString('fr-TN')} TND/mois
                  </div>
                  <div className="text-[10px] font-mono text-sky-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Consulter les murs & fonds</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>

                {/* Typology 4: Duplex & Penthouses */}
                <div 
                  onClick={() => jumpToPropertiesWithCategory('Duplex')}
                  className="glass-navy p-5 rounded-xl border border-white/10 hover:border-brand-gold/50 cursor-pointer transition-all space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider group-hover:text-brand-gold transition-colors">
                      🏢 Duplex & Penthouses
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-white/10 text-white px-2 py-0.5 rounded border border-white/20">
                      {properties.filter(p => p.category === 'Duplex' || p.category === 'Penthouse' || p.category === 'Appartement').length} Biens
                    </span>
                  </div>
                  <div className="text-xs text-brand-travertine/70 font-mono">
                    Standing urbain à Sfax & Tunis
                  </div>
                  <div className="text-[10px] font-mono text-brand-gold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Consulter les appartements de prestige</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>

                {/* Typology 5: Villas de Séjour (Luxe) */}
                <div 
                  onClick={() => jumpToPropertiesWithUniverse('LUXE')}
                  className="glass-navy p-5 rounded-xl border border-emerald-500/30 hover:border-emerald-400 cursor-pointer transition-all space-y-3 group bg-emerald-950/10"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider group-hover:text-white transition-colors">
                      🌴 Villas de Séjour & Conciergerie
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">
                      {properties.filter(p => p.universe === 'LUXE').length} Demeures
                    </span>
                  </div>
                  <div className="text-xs text-emerald-200/80 font-mono">
                    {reservations.length} Séjours enregistrés • {confirmedBookingsCount} Confirmés
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Voir le planning des séjours</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>

                {/* Typology 6: Terrains Titrés */}
                <div 
                  onClick={() => jumpToPropertiesWithCategory('Terrain')}
                  className="glass-navy p-5 rounded-xl border border-white/10 hover:border-brand-gold/50 cursor-pointer transition-all space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider group-hover:text-brand-gold transition-colors">
                      📐 Terrains & Domaines Foncier
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-white/10 text-white px-2 py-0.5 rounded border border-white/20">
                      {properties.filter(p => p.category === 'Terrain').length} Parcelles
                    </span>
                  </div>
                  <div className="text-xs text-brand-travertine/70 font-mono">
                    Titres fonciers individuels vérifiés (CPF)
                  </div>
                  <div className="text-[10px] font-mono text-brand-gold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Examiner les parcelles</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Interconnected Cross-Entity Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Feed 1: Latest Submissions */}
              <div className="glass-navy p-5 sm:p-6 rounded-2xl border border-brand-gold/20 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-brand-gold flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-brand-gold" />
                      <span>Dernières Soumissions</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('submissions')}
                      className="text-[11px] font-mono text-brand-gold hover:underline flex items-center gap-1"
                    >
                      <span>Voir tout ({submissions.length})</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="divide-y divide-white/5 mt-2">
                    {submissions.slice(0, 3).map((sub) => (
                      <div key={sub.id} className="py-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-brand-gold">{sub.refCode}</span>
                          <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                            sub.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {sub.status === 'APPROVED' ? (sub.isPublished ? 'Publié' : 'Validé Privé') : 'À instruire'}
                          </span>
                        </div>
                        <div className="text-xs text-white font-medium truncate">{sub.ownerName} — {sub.propertyType}</div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-brand-travertine/60">
                          <span>{sub.district || sub.city}</span>
                          <span className="text-brand-gold font-bold">{(sub.estimatedPrice || sub.estimatedValue || 0).toLocaleString()} TND</span>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => generateSubmissionPdf(sub)}
                            className="text-[10px] font-mono text-brand-gold hover:underline flex items-center gap-1 bg-brand-gold/10 px-2 py-1 rounded"
                          >
                            <FileDown className="w-3 h-3" />
                            <span>PDF Branded</span>
                          </button>
                          <button
                            onClick={() => {
                              setInspectingSubmission(sub);
                            }}
                            className="text-[10px] font-mono text-white/80 hover:text-white flex items-center gap-1 bg-white/5 px-2 py-1 rounded"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Inspecter</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href="/proposer-un-bien"
                  target="_blank"
                  className="w-full text-center py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-brand-travertine text-xs font-mono font-bold border border-white/10 transition-all block mt-2"
                >
                  Ouvrir Formulaire Public Proposer un Bien ↗
                </Link>
              </div>

              {/* Feed 2: Latest CRM Opportunities */}
              <div className="glass-navy p-5 sm:p-6 rounded-2xl border border-brand-gold/20 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span>Derniers Prospects CRM</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('crm')}
                      className="text-[11px] font-mono text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <span>Pipeline ({leads.length})</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="divide-y divide-white/5 mt-2">
                    {leads.slice(0, 3).map((lead) => (
                      <div key={lead.id} className="py-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white truncate">{lead.name}</span>
                          <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                            {lead.status}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-brand-gold truncate">
                          {lead.propertyTitle || 'Recherche globale'}
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-brand-travertine/60">
                          <span>{lead.phone}</span>
                          <span>{lead.source}</span>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <a
                            href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${lead.name}, suite à votre demande concernant ${lead.propertyTitle || 'nos biens'} à Villa Regia...`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-mono text-emerald-400 hover:underline flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                          <button
                            onClick={() => {
                              setActiveTab('crm');
                              setCrmSearch(lead.name);
                            }}
                            className="text-[10px] font-mono text-white/80 hover:text-white flex items-center gap-1 bg-white/5 px-2 py-1 rounded"
                          >
                            <ArrowRight className="w-3 h-3" />
                            <span>Gérer Fiche</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setNewLeadModalOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/30 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Nouveau Prospect Acquéreur</span>
                </button>
              </div>

              {/* Feed 3: Latest Reservations */}
              <div className="glass-navy p-5 sm:p-6 rounded-2xl border border-brand-gold/20 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-brand-gold flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-gold" />
                      <span>Derniers Séjours Luxe</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('reservations')}
                      className="text-[11px] font-mono text-brand-gold hover:underline flex items-center gap-1"
                    >
                      <span>Planning ({reservations.length})</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="divide-y divide-white/5 mt-2">
                    {reservations.length === 0 ? (
                      <div className="py-8 text-center text-xs text-brand-travertine/40 font-mono">
                        Aucun séjour en cours
                      </div>
                    ) : (
                      reservations.slice(0, 3).map((r) => (
                        <div key={r.id} className="py-3 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white truncate">{r.guestName}</span>
                            <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                              r.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              {r.status === 'CONFIRMED' ? 'Confirmé' : 'En attente'}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-brand-gold truncate">
                            {r.propertyTitle}
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-mono text-brand-travertine/60">
                            <span>Du {r.checkIn} au {r.checkOut}</span>
                            <span className="text-emerald-400 font-bold">{r.depositAmount || 0} TND Acompte</span>
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <a
                              href={`https://wa.me/${r.guestPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${r.guestName}, concernant votre réservation ${r.id} à Villa Regia...`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-mono text-emerald-400 hover:underline flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </a>
                            <button
                              onClick={() => {
                                setActiveTab('reservations');
                                setReservationSearch(r.guestName);
                              }}
                              className="text-[10px] font-mono text-white/80 hover:text-white flex items-center gap-1 bg-white/5 px-2 py-1 rounded"
                            >
                              <ArrowRight className="w-3 h-3" />
                              <span>Détails</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <Link
                  href="/villas-de-luxe"
                  target="_blank"
                  className="w-full text-center py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-brand-travertine text-xs font-mono font-bold border border-white/10 transition-all block mt-2"
                >
                  Voir Catalogue Villas de Séjour ↗
                </Link>
              </div>
            </div>

            {/* 4. Quick Action Executive Bar */}
            <div className="glass-navy p-5 rounded-2xl border border-brand-gold/25 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-gold" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Actions Exécutives Immobilières
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={openAddPropertyModal}
                  className="px-3 py-2 rounded-xl bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-navy text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter un Bien</span>
                </button>
                <button
                  onClick={() => setNewLeadModalOpen(true)}
                  className="px-3 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Saisir Lead CRM</span>
                </button>
                <button
                  onClick={openAddArticleModal}
                  className="px-3 py-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Rédiger Article</span>
                </button>
                <Link
                  href="/properties"
                  target="_blank"
                  className="px-3 py-2 rounded-xl bg-white/5 text-white/80 hover:text-white border border-white/10 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Catalogue Public</span>
                </Link>
              </div>
            </div>

            {/* 5. System Audit Trail */}
            <div className="glass-card p-5 sm:p-6 rounded-2xl border border-brand-gold/20 space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-brand-gold flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Journal d'Activité Récente & Sécurité Audit</span>
                </h2>
                <span className="text-xs font-mono text-brand-travertine/50">{auditLogs.length} événements enregistrés</span>
              </div>
              <div className="divide-y divide-white/5 text-xs">
                {auditLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between font-mono text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="bg-brand-gold/15 text-brand-gold px-2 py-0.5 rounded text-[10px] font-bold">{log.role}</span>
                      <span className="text-white font-bold">{log.userName}:</span>
                      <span className="text-brand-travertine/80">{log.action} ({log.target})</span>
                    </div>
                    <span className="text-brand-travertine/40 text-[10px]">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: OWNER SUBMISSIONS ("PROPOSER UN BIEN") */}
        {activeTab === 'submissions' && hasPermission('properties.read') && (
          <div className="glass-navy p-6 rounded-2xl border border-brand-gold/30 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-brand-gold flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-brand-gold" />
                  <span>Dossiers de Soumissions Mandats Propriétaires</span>
                </h2>
                <p className="text-xs text-brand-travertine/60 font-light mt-0.5">
                  Examinez les mandats proposés, téléchargez la fiche A4 brandée signée, et approuvez avec ou sans mise en ligne.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <Link
                  href="/proposer-un-bien"
                  target="_blank"
                  className="bg-white/10 hover:bg-white/20 text-brand-travertine px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-white/10 shrink-0"
                >
                  <span>Formulaire Public</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Submissions Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-white/10">
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-mono">
                {[
                  { id: 'ALL', label: `Toutes (${submissions.length})` },
                  { id: 'PENDING', label: `À Instruire (${pendingSubmissionsCount})`, count: pendingSubmissionsCount },
                  { id: 'APPROVED_UNPUBLISHED', label: `Privés Hors-Ligne (${approvedUnpublishedCount})` },
                  { id: 'APPROVED_PUBLISHED', label: `Publiés (${approvedPublishedCount})` },
                  { id: 'REJECTED', label: `Refusés (${submissions.filter(s => s.status === 'REJECTED').length})` },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setSubmissionFilter(st.id)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                      submissionFilter === st.id
                        ? 'bg-brand-gold text-brand-navy font-bold shadow'
                        : 'bg-white/5 text-brand-travertine/70 hover:text-white'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-brand-gold absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher nom, réf, tél, ville..."
                  value={submissionSearch}
                  onChange={(e) => setSubmissionSearch(e.target.value)}
                  className="w-full bg-brand-navy border border-white/20 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-gold font-mono"
                />
              </div>
            </div>

            {/* Mobile View: Cards */}
            <div className="space-y-4 block lg:hidden">
              {filteredSubmissions.length === 0 ? (
                <div className="text-center py-12 text-xs font-mono text-brand-travertine/50">
                  Aucun dossier ne correspond à votre filtre.
                </div>
              ) : (
                filteredSubmissions.map((sub) => {
                  const ownerUser = staffUsers.find(u => u.email === sub.ownerEmail);
                  const ownerLead = leads.find(l => l.phone === sub.ownerPhone || (sub.ownerEmail && l.email === sub.ownerEmail));
                  return (
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
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {ownerUser && (
                      <span className="text-[9px] font-mono font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                        <Users className="w-3 h-3 text-blue-400" />
                        <span>Compte Client VIP</span>
                      </span>
                    )}
                    {ownerLead ? (
                      <button
                        onClick={() => jumpToCrmWithLead(ownerLead.email || ownerLead.phone)}
                        className="text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1 hover:bg-emerald-500/25"
                        title="Voir la fiche correspondante dans le CRM"
                      >
                        <Link2 className="w-3 h-3 text-emerald-400" />
                        <span>Lead CRM ({ownerLead.status})</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCreateLeadFromSubmission(sub)}
                        className="text-[9px] font-mono font-bold bg-white/5 text-brand-gold border border-brand-gold/30 px-2 py-0.5 rounded flex items-center gap-1 hover:bg-brand-gold/20"
                        title="Convertir automatiquement ce propriétaire en prospect dans le CRM"
                      >
                        <UserPlus className="w-3 h-3 text-brand-gold" />
                        <span>+ Créer Fiche CRM</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/10 flex-wrap">
                  <button
                    onClick={() => generateSubmissionPdf(sub)}
                    className="bg-brand-gold text-brand-navy p-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold font-mono transition-all hover:opacity-90 shadow"
                    title="Télécharger la fiche dossier en PDF signé & brandé"
                  >
                    <FileDown className="w-4 h-4" />
                    <span className="text-[11px]">PDF</span>
                  </button>

                  <button
                    onClick={() => setInspectingSubmission(sub)}
                    className="bg-brand-gold/15 hover:bg-brand-gold/25 text-brand-gold border border-brand-gold/30 p-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold font-mono transition-all"
                    title="Examiner l'intégralité du dossier"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-[11px]">Détails</span>
                  </button>

                  {sub.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleApproveSubmission(sub, false)}
                        className="bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border border-sky-500/30 p-2.5 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-1"
                        title="Valider en interne sans publier au catalogue public"
                      >
                        <Check className="w-4 h-4" />
                        <span className="text-[10px]">Approuver</span>
                      </button>
                      <button
                        onClick={() => handleApproveSubmission(sub, true)}
                        className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 p-2.5 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-1"
                        title="Approuver et publier au catalogue public"
                      >
                        <Check className="w-4 h-4" />
                        <span className="text-[10px]">Publier</span>
                      </button>
                    </>
                  )}

                  {sub.status === 'APPROVED' && !sub.isPublished && (
                    <button
                      onClick={() => handleApproveSubmission(sub, true)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-brand-navy px-3 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-1 shadow"
                      title="Publier maintenant au catalogue"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Mettre en ligne</span>
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
            );
          })
        )}
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
            {filteredSubmissions.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-xs font-mono text-brand-travertine/50">
                  Aucun dossier ne correspond aux critères de recherche.
                </td>
              </tr>
            ) : (
              filteredSubmissions.map((sub) => {
                const ownerUser = staffUsers.find(u => u.email === sub.ownerEmail);
                const ownerLead = leads.find(l => l.phone === sub.ownerPhone || (sub.ownerEmail && l.email === sub.ownerEmail));
                return (
                  <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-mono font-bold text-brand-gold">{sub.refCode}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-white">{sub.ownerName}</span>
                        {ownerUser && (
                          <span className="text-[8px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.2 rounded">VIP</span>
                        )}
                        {ownerLead && (
                          <button
                            onClick={() => jumpToCrmWithLead(ownerLead.email || ownerLead.phone)}
                            className="text-[8px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded hover:underline"
                            title="Voir la fiche CRM"
                          >
                            CRM
                          </button>
                        )}
                      </div>
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
                          sub.status === 'APPROVED' && sub.isPublished
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : sub.status === 'APPROVED' && !sub.isPublished
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            : sub.status === 'REJECTED'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {sub.status === 'APPROVED' && sub.isPublished
                            ? 'Validé & Publié'
                            : sub.status === 'APPROVED' && !sub.isPublished
                            ? 'Approuvé (Non publié)'
                            : sub.status === 'REJECTED'
                            ? 'Refusé'
                            : 'En Attente'}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => generateSubmissionPdf(sub)}
                          className="bg-brand-gold text-brand-navy hover:opacity-90 px-2.5 py-1.5 rounded-lg text-[10px] font-bold font-mono inline-flex items-center gap-1 transition-all shadow"
                          title="Télécharger la Fiche Dossier PDF Brandée"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>

                        <button
                          onClick={() => setInspectingSubmission(sub)}
                          className="bg-white/5 hover:bg-brand-gold/20 text-brand-travertine hover:text-brand-gold p-2 rounded-lg inline-flex items-center gap-1 transition-colors"
                          title="Examiner l'intégralité du formulaire et pièces jointes"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-mono">Dossier</span>
                        </button>

                        {sub.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApproveSubmission(sub, false)}
                              className="bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border border-sky-500/30 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all inline-flex items-center gap-1"
                              title="Valider en interne sans publier au catalogue"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approuver</span>
                            </button>
                            <button
                              onClick={() => handleApproveSubmission(sub, true)}
                              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all inline-flex items-center gap-1"
                              title="Approuver et publier au catalogue public"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Publier</span>
                            </button>
                          </>
                        )}

                        {sub.status === 'APPROVED' && !sub.isPublished && (
                          <button
                            onClick={() => handleApproveSubmission(sub, true)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-brand-navy px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all inline-flex items-center gap-1 shadow"
                            title="Publier maintenant au catalogue public"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Publier au catalogue</span>
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
                  );
                })
              )}
            </tbody>
            </table>
            </div>
          </div>
        )}

        {/* TAB 2: FUNCTIONAL PROPERTIES MANAGEMENT */}
        {activeTab === 'properties' && hasPermission('properties.read') && (
          <div className="glass-navy p-6 rounded-2xl border border-brand-gold/30 space-y-6">
            
            {/* Properties Filter & Action Toolbar */}
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
              <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                {/* Search query */}
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Rechercher titre, quartier, ID..."
                    value={propertySearch}
                    onChange={(e) => setPropertySearch(e.target.value)}
                    className="w-full bg-brand-navy border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-gold font-mono"
                  />
                  <Search className="w-3.5 h-3.5 text-brand-travertine/40 absolute right-3 top-2.5" />
                </div>

                {/* Universe Filter */}
                <select
                  value={universeFilter}
                  onChange={(e) => setUniverseFilter(e.target.value)}
                  className="bg-brand-navy border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-gold font-mono"
                >
                  <option value="ALL">Tous les Univers</option>
                  <option value="VENTE">VENTE</option>
                  <option value="RESIDENCE">RÉSIDENCE</option>
                  <option value="LUXE">VILLAS DE LUXE</option>
                  <option value="EVENT">ÉVÉNEMENTIEL</option>
                </select>

                {/* Category Filter */}
                <select
                  value={propertyCategoryFilter}
                  onChange={(e) => setPropertyCategoryFilter(e.target.value)}
                  className="bg-brand-navy border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-gold font-mono"
                >
                  <option value="ALL">Toutes les Typologies</option>
                  <option value="Villa">Villas de Prestige</option>
                  <option value="Villa Semi-Construite">Villas Semi-Construites</option>
                  <option value="Espace Commercial">Espaces Commerciaux</option>
                  <option value="Fond de commerce">Fonds de Commerce</option>
                  <option value="Duplex">Duplex</option>
                  <option value="Penthouse">Penthouses</option>
                  <option value="Maison de Maître">Maisons de Maître</option>
                  <option value="Terrain">Terrains & Domaines</option>
                </select>

                {/* Status Filter */}
                <select
                  value={propertyStatusFilter}
                  onChange={(e) => setPropertyStatusFilter(e.target.value)}
                  className="bg-brand-navy border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-gold font-mono"
                >
                  <option value="ALL">Tous les Statuts</option>
                  <option value="DISPONIBLE">DISPONIBLE</option>
                  <option value="SOUS_OFFRE">SOUS OFFRE</option>
                  <option value="VENDU">VENDU</option>
                  <option value="LOUE">LOUÉ</option>
                </select>
              </div>

              {hasPermission('properties.create') && (
                <button
                  onClick={openAddPropertyModal}
                  className="bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-navy px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow hover:opacity-95 transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter une Propriété</span>
                </button>
              )}
            </div>

            {/* Mobile View: Cards */}
            <div className="space-y-4 block lg:hidden">
              {filteredProperties.length === 0 ? (
                <div className="text-center py-12 text-xs font-mono text-brand-travertine/50">
                  Aucune propriété ne correspond à votre filtre.
                </div>
              ) : (
                filteredProperties.map((p) => {
                  const propLeads = leads.filter(l => l.propertyTitle?.toLowerCase() === p.title.fr.toLowerCase() || l.propertyTitle?.includes(p.id));
                  const propBookings = reservations.filter(r => r.propertyId === p.id || r.propertyTitle === p.title.fr);
                  return (
                    <div
                      key={p.id}
                      className="glass-card p-4 rounded-2xl border border-white/10 space-y-3 shadow-xl"
                    >
                      <div className="flex gap-3">
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-brand-gold/30 shrink-0">
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

                      {/* Interconnected Activity Badges */}
                      <div className="flex items-center gap-2 pt-1 border-t border-white/5 flex-wrap">
                        {propLeads.length > 0 && (
                          <button
                            onClick={() => jumpToCrmWithProperty(p.title.fr)}
                            className="bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono font-bold px-2 py-0.5 rounded-lg flex items-center gap-1"
                            title="Voir les demandes CRM pour ce bien"
                          >
                            <Users className="w-3 h-3 text-emerald-400" />
                            <span>{propLeads.length} Lead(s) CRM</span>
                          </button>
                        )}
                        {propBookings.length > 0 && (
                          <button
                            onClick={() => jumpToReservationsWithProperty(p.title.fr)}
                            className="bg-brand-gold/15 hover:bg-brand-gold/25 text-brand-gold border border-brand-gold/30 text-[9px] font-mono font-bold px-2 py-0.5 rounded-lg flex items-center gap-1"
                            title="Voir les réservations pour ce bien"
                          >
                            <Calendar className="w-3 h-3 text-brand-gold" />
                            <span>{propBookings.length} Séjour(s)</span>
                          </button>
                        )}
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
                  );
                })
              )}
            </div>

            {/* Desktop View: Table */}
            <div className="overflow-x-auto hidden lg:block">
              <table className="w-full text-left text-xs text-brand-travertine/80">
                <thead className="bg-brand-navy text-brand-gold font-mono uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Visuel</th>
                    <th className="p-3">Intitulé & Interconnexions</th>
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
                  {filteredProperties.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-xs font-mono text-brand-travertine/50">
                        Aucun bien ne correspond aux critères de recherche.
                      </td>
                    </tr>
                  ) : (
                    filteredProperties.map((p) => {
                      const propLeads = leads.filter(l => l.propertyTitle?.toLowerCase() === p.title.fr.toLowerCase() || l.propertyTitle?.includes(p.id));
                      const propBookings = reservations.filter(r => r.propertyId === p.id || r.propertyTitle === p.title.fr);
                      return (
                        <tr key={p.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3">
                            <div className="relative w-12 h-10 rounded overflow-hidden">
                              <Image src={p.images[0]?.url || ''} alt={p.title.fr} fill className="object-cover" />
                            </div>
                          </td>
                          <td className="p-3 font-semibold text-white max-w-xs">
                            <div className="truncate">{p.title.fr}</div>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Link
                                href={`/properties/${p.id}`}
                                target="_blank"
                                className="text-[10px] text-brand-gold hover:underline inline-flex items-center gap-1 font-mono"
                              >
                                <span>Fiche public</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </Link>
                              {propLeads.length > 0 && (
                                <button
                                  onClick={() => jumpToCrmWithProperty(p.title.fr)}
                                  className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded hover:underline"
                                  title="Voir les demandes CRM pour ce bien"
                                >
                                  {propLeads.length} Lead(s)
                                </button>
                              )}
                              {propBookings.length > 0 && (
                                <button
                                  onClick={() => jumpToReservationsWithProperty(p.title.fr)}
                                  className="text-[9px] font-mono font-bold bg-brand-gold/20 text-brand-gold border border-brand-gold/30 px-1.5 py-0.2 rounded hover:underline"
                                  title="Voir les réservations pour ce bien"
                                >
                                  {propBookings.length} Séjour(s)
                                </button>
                              )}
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
                          title="Modifier"
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
                  );
                })
              )}
                </tbody>
              </table>
            </div>

            {filteredProperties.length === 0 && (
              <div className="p-8 text-center text-white/50 text-xs font-mono rounded-xl bg-white/5 border border-white/10 lg:hidden">
                {isInitialLoading ? 'Chargement des biens...' : 'Aucune propriété enregistrée.'}
              </div>
            )}

          </div>
        )}

        {/* TAB 3: FUNCTIONAL CRM LEAD PIPELINE */}
        {activeTab === 'crm' && hasPermission('leads.read') && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-brand-gold flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-brand-gold" />
                  <span>Pipeline Commercial CRM & Opportunités</span>
                </h2>
                <p className="text-xs text-brand-travertine/60 font-light mt-0.5">
                  Suivi des acheteurs, investisseurs et locataires VIP qualifiés par le staff.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setNewLeadModalOpen(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Nouveau Lead Client</span>
                </button>
              </div>
            </div>

            {/* CRM Search & Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="relative w-full sm:w-80">
                <Search className="w-3.5 h-3.5 text-brand-gold absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filtrer leads par client, tél, email, bien..."
                  value={crmSearch}
                  onChange={(e) => setCrmSearch(e.target.value)}
                  className="w-full bg-brand-navy border border-white/20 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-gold font-mono"
                />
              </div>

              {crmSearch && (
                <button
                  onClick={() => setCrmSearch('')}
                  className="text-xs text-brand-gold hover:underline font-mono"
                >
                  Réinitialiser le filtre ("{crmSearch}")
                </button>
              )}
            </div>
            
            <div className="flex md:grid md:grid-cols-5 gap-4 overflow-x-auto pb-4 scrollbar-none snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
              {(['Nouveau', 'Contacté', 'Visite', 'Offre', 'Conclu'] as const).map((stage) => {
                const stageLeads = filteredLeads.filter((l) => l.status === stage);
                return (
                  <div key={stage} className="glass-card rounded-2xl p-4 space-y-3 min-h-[360px] border border-brand-gold/15 min-w-[280px] sm:min-w-[300px] md:min-w-0 snap-start flex-1 shrink-0 shadow-lg">
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <span className="text-xs font-mono font-bold text-brand-travertine uppercase">{stage}</span>
                      <span className="text-[10px] bg-brand-gold text-brand-navy px-2 py-0.5 rounded font-mono font-bold">
                        {stageLeads.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {stageLeads.length === 0 ? (
                        <div className="text-center py-8 text-[11px] font-mono text-white/30">
                          Aucun prospect
                        </div>
                      ) : (
                        stageLeads.map((lead) => {
                          const matchedProp = properties.find(p => p.title.fr.toLowerCase() === lead.propertyTitle?.toLowerCase() || (lead.propertyTitle && p.title.fr.toLowerCase().includes(lead.propertyTitle.toLowerCase())));
                          return (
                            <div
                              key={lead.id}
                              className="glass-navy p-4 rounded-xl border border-white/10 space-y-3 hover:border-brand-gold/40 transition-colors shadow-md"
                            >
                              <div className="flex justify-between items-start">
                                <span className="text-xs font-bold text-white">{lead.name}</span>
                                <span className="text-[9px] bg-brand-gold/15 text-brand-gold px-1.5 py-0.5 rounded font-mono font-bold">
                                  {lead.universe}
                                </span>
                              </div>

                              {/* Connected Property Thumbnail if matched */}
                              {matchedProp ? (
                                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white/5 border border-white/8">
                                  <div className="relative w-10 h-10 rounded overflow-hidden shrink-0 border border-brand-gold/30">
                                    <Image src={matchedProp.images[0]?.url || ''} alt="" fill className="object-cover" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <Link
                                      href={`/properties/${matchedProp.id}`}
                                      target="_blank"
                                      className="text-[11px] font-semibold text-white hover:text-brand-gold truncate block"
                                    >
                                      {matchedProp.title.fr}
                                    </Link>
                                    <span className="text-[9px] font-mono text-brand-gold">
                                      {matchedProp.price.amount.toLocaleString()} {matchedProp.price.currency}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-[11px] text-brand-travertine/70 line-clamp-1">{lead.propertyTitle}</p>
                              )}

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
                                <span className="text-brand-travertine/60 truncate max-w-[90px]">{lead.assignedAgent || 'Non assigné'}</span>
                                
                                <div className="flex items-center gap-1.5">
                                  <a
                                    href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${lead.name}, Villa Regia vous contacte au sujet de ${lead.propertyTitle || 'votre projet immobilier'}...`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 rounded bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                                    title="Contacter par WhatsApp"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                  </a>
                                  <button
                                    onClick={() => openLeadModal(lead)}
                                    className="text-brand-gold hover:underline font-bold px-1 py-0.5"
                                  >
                                    Gérer
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLead(lead.id, lead.name)}
                                    className="text-brand-travertine/40 hover:text-red-400 p-1"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: RESERVATIONS MANAGER */}
        {activeTab === 'reservations' && hasPermission('reservations.read') && (
          <div className="glass-navy p-6 rounded-2xl border border-brand-gold/30 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-brand-gold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-gold" />
                  <span>Gestion des Réservations & Acomptes Court Séjour</span>
                </h2>
                <p className="text-xs text-brand-travertine/60 font-light mt-0.5">
                  Suivez les réservations de villas d'exception, vérifiez les acomptes et convertissez les voyageurs en leads CRM.
                </p>
              </div>

              <div className="text-xs font-mono text-brand-gold font-bold">
                Total Acomptes: {totalBookingsDeposit.toLocaleString()} TND
              </div>
            </div>

            {/* Reservations Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-white/10">
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-mono">
                {[
                  { id: 'ALL', label: `Toutes (${reservations.length})` },
                  { id: 'CONFIRMED', label: `Confirmées (${reservations.filter(r => r.status === 'CONFIRMED').length})` },
                  { id: 'PENDING', label: `En Attente (${reservations.filter(r => r.status === 'PENDING').length})` },
                  { id: 'CANCELLED', label: `Annulées (${reservations.filter(r => r.status === 'CANCELLED').length})` },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setReservationStatusFilter(st.id)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                      reservationStatusFilter === st.id
                        ? 'bg-brand-gold text-brand-navy font-bold shadow'
                        : 'bg-white/5 text-brand-travertine/70 hover:text-white'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-brand-gold absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher client, villa, tél, réf..."
                  value={reservationSearch}
                  onChange={(e) => setReservationSearch(e.target.value)}
                  className="w-full bg-brand-navy border border-white/20 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-gold font-mono"
                />
              </div>
            </div>

            {/* Mobile View: Cards */}
            <div className="space-y-4 block lg:hidden">
              {filteredReservations.length === 0 ? (
                <div className="text-center py-12 text-xs font-mono text-brand-travertine/50">
                  Aucune réservation ne correspond à vos filtres.
                </div>
              ) : (
                filteredReservations.map((r) => {
                  const matchedProp = properties.find(p => p.id === r.propertyId || p.title.fr === r.propertyTitle);
                  const guestLead = leads.find(l => l.phone === r.guestPhone || (r.guestEmail && l.email === r.guestEmail));
                  return (
                    <div key={r.id} className="glass-card p-4 rounded-2xl border border-white/10 space-y-3 shadow-xl">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-xs text-brand-gold">{r.id}</span>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          r.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {r.status}
                        </span>
                      </div>

                      <div className="flex gap-3">
                        {matchedProp && (
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-brand-gold/30 shrink-0">
                            <Image src={matchedProp.images[0]?.url || ''} alt="" fill className="object-cover" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-white truncate">{r.propertyTitle}</h3>
                          <div className="text-xs text-white/60 mt-0.5">{r.guestName} • <span className="font-mono text-brand-gold">{r.guestPhone}</span></div>
                          {matchedProp && (
                            <Link
                              href={`/properties/${matchedProp.id}`}
                              target="_blank"
                              className="text-[10px] text-brand-gold hover:underline inline-flex items-center gap-1 mt-0.5"
                            >
                              <span>Voir fiche publique</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-white/5 border border-white/8 text-xs font-mono">
                        <div>
                          <span className="text-white/40 block text-[10px]">Dates Séjour</span>
                          <span className="text-white/90 text-[11px]">{r.checkIn} → {r.checkOut}</span>
                        </div>
                        <div>
                          <span className="text-white/40 block text-[10px]">Acompte ({r.totalNights} n.)</span>
                          <span className="text-brand-gold font-bold text-xs">{r.depositAmount} TND</span>
                        </div>
                      </div>

                      {/* Interconnection with CRM */}
                      <div className="flex items-center gap-2 pt-1 border-t border-white/5 flex-wrap">
                        {guestLead ? (
                          <button
                            onClick={() => jumpToCrmWithLead(guestLead.email || guestLead.phone)}
                            className="text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1 hover:bg-emerald-500/25"
                          >
                            <Link2 className="w-3 h-3 text-emerald-400" />
                            <span>Lead CRM ({guestLead.status})</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCreateLeadFromReservation(r)}
                            className="text-[9px] font-mono font-bold bg-white/5 text-brand-gold border border-brand-gold/30 px-2 py-0.5 rounded-lg flex items-center gap-1 hover:bg-brand-gold/20"
                          >
                            <UserPlus className="w-3 h-3 text-brand-gold" />
                            <span>+ Créer Fiche CRM</span>
                          </button>
                        )}
                        <a
                          href={`https://wa.me/${r.guestPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${r.guestName}, Villa Regia vous contacte au sujet de votre réservation ${r.id} pour ${r.propertyTitle}...`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1 hover:bg-emerald-500/20 ml-auto"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                        {r.status !== 'CONFIRMED' && (
                          <button
                            onClick={() => handleUpdateReservationStatus(r.id, 'CONFIRMED')}
                            className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 py-2 rounded-xl text-xs font-bold uppercase"
                          >
                            Valider
                          </button>
                        )}
                        {r.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleUpdateReservationStatus(r.id, 'CANCELLED')}
                            className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 rounded-xl text-xs font-bold uppercase"
                          >
                            Annuler
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Desktop View: Table */}
            <div className="overflow-x-auto hidden lg:block">
              <table className="w-full text-left text-xs text-brand-travertine/80">
                <thead className="bg-brand-navy text-brand-gold font-mono uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Ref</th>
                    <th className="p-3">Propriété</th>
                    <th className="p-3">Client & CRM</th>
                    <th className="p-3">Dates</th>
                    <th className="p-3">Nuits</th>
                    <th className="p-3">Acompte</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3 text-right">Actions Operatoires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredReservations.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-xs font-mono text-brand-travertine/50">
                        Aucune réservation trouvée pour cette sélection.
                      </td>
                    </tr>
                  ) : (
                    filteredReservations.map((r) => {
                      const matchedProp = properties.find(p => p.id === r.propertyId || p.title.fr === r.propertyTitle);
                      const guestLead = leads.find(l => l.phone === r.guestPhone || (r.guestEmail && l.email === r.guestEmail));
                      return (
                        <tr key={r.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3 font-mono text-brand-gold font-bold">{r.id}</td>
                          <td className="p-3 font-semibold text-white max-w-xs">
                            <div className="flex items-center gap-2">
                              {matchedProp && (
                                <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-brand-gold/30 shrink-0">
                                  <Image src={matchedProp.images[0]?.url || ''} alt="" fill className="object-cover" />
                                </div>
                              )}
                              <div className="truncate">
                                <span>{r.propertyTitle}</span>
                                {matchedProp && (
                                  <Link
                                    href={`/properties/${matchedProp.id}`}
                                    target="_blank"
                                    className="text-[10px] text-brand-gold hover:underline block font-mono font-normal"
                                  >
                                    Fiche villa ↗
                                  </Link>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-white font-medium">{r.guestName}</span>
                              {guestLead ? (
                                <button
                                  onClick={() => jumpToCrmWithLead(guestLead.email || guestLead.phone)}
                                  className="text-[8px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded hover:underline"
                                  title="Voir fiche CRM"
                                >
                                  CRM
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleCreateLeadFromReservation(r)}
                                  className="text-[8px] font-mono bg-white/5 text-brand-gold border border-brand-gold/30 px-1.5 py-0.2 rounded hover:bg-brand-gold/20"
                                  title="Créer prospect CRM"
                                >
                                  + CRM
                                </button>
                              )}
                            </div>
                            <div className="text-[10px] text-brand-travertine/50 font-mono flex items-center gap-1 mt-0.5">
                              <span>{r.guestPhone}</span>
                              <a
                                href={`https://wa.me/${r.guestPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${r.guestName}, Villa Regia vous contacte au sujet de votre réservation ${r.id}...`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-400 hover:text-emerald-300 ml-1"
                                title="WhatsApp"
                              >
                                <MessageCircle className="w-3 h-3" />
                              </a>
                            </div>
                          </td>
                          <td className="p-3 font-mono text-brand-travertine/70">{r.checkIn} au {r.checkOut}</td>
                          <td className="p-3 font-mono">{r.totalNights} nuits</td>
                          <td className="p-3 font-mono text-brand-gold font-bold">{r.depositAmount} TND</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              r.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-2">
                            {r.status !== 'CONFIRMED' && (
                              <button
                                onClick={() => handleUpdateReservationStatus(r.id, 'CONFIRMED')}
                                className="bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg text-[10px] font-bold hover:bg-emerald-500/30"
                              >
                                Valider
                              </button>
                            )}
                            {r.status !== 'CANCELLED' && (
                              <button
                                onClick={() => handleUpdateReservationStatus(r.id, 'CANCELLED')}
                                className="bg-red-500/20 text-red-400 px-2.5 py-1 rounded-lg text-[10px] font-bold hover:bg-red-500/30"
                              >
                                Annuler
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
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
                .map((u) => {
                  const userSubmissions = submissions.filter(s => s.ownerEmail === u.email || (u.phone && s.ownerPhone === u.phone));
                  const userReservations = reservations.filter(r => r.guestEmail === u.email || (u.phone && r.guestPhone === u.phone));
                  const userLeads = leads.filter(l => l.email === u.email || (u.phone && l.phone === u.phone));

                  return (
                    <div key={u.id} className="glass-card p-4 rounded-2xl border border-white/10 space-y-3 shadow-xl">
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
                          {u.phone && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[11px] font-mono text-brand-gold">{u.phone}</span>
                              <a
                                href={`https://wa.me/${u.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-400 hover:text-emerald-300"
                                title="WhatsApp"
                              >
                                <MessageCircle className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Cross-Connected Metrics */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-white/5">
                        {userSubmissions.length > 0 && (
                          <button
                            onClick={() => jumpToSubmissionsWithOwner(u.name)}
                            className="text-[9px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1 hover:bg-amber-500/25"
                            title="Voir les mandats proposés par cet utilisateur"
                          >
                            <FileCheck className="w-3 h-3 text-amber-400" />
                            <span>{userSubmissions.length} Mandat(s)</span>
                          </button>
                        )}
                        {userReservations.length > 0 && (
                          <button
                            onClick={() => jumpToReservationsWithGuest(u.name)}
                            className="text-[9px] font-mono font-bold bg-brand-gold/15 text-brand-gold border border-brand-gold/30 px-2 py-0.5 rounded-lg flex items-center gap-1 hover:bg-brand-gold/25"
                            title="Voir les séjours réservés par cet utilisateur"
                          >
                            <Calendar className="w-3 h-3 text-brand-gold" />
                            <span>{userReservations.length} Séjour(s)</span>
                          </button>
                        )}
                        {userLeads.length > 0 && (
                          <button
                            onClick={() => jumpToCrmWithLead(u.email || u.phone || '')}
                            className="text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1 hover:bg-emerald-500/25"
                            title="Voir les fiches CRM associées"
                          >
                            <Users className="w-3 h-3 text-emerald-400" />
                            <span>{userLeads.length} Lead(s) CRM</span>
                          </button>
                        )}
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
                  );
                })}
            </div>

            {/* Desktop View: Table */}
            <div className="overflow-x-auto hidden lg:block">
              <table className="w-full text-left text-xs text-brand-travertine/80">
                <thead className="bg-brand-navy text-brand-gold font-mono uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Utilisateur & Dossiers Connectés</th>
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
                    .map((u) => {
                      const userSubmissions = submissions.filter(s => s.ownerEmail === u.email || (u.phone && s.ownerPhone === u.phone));
                      const userReservations = reservations.filter(r => r.guestEmail === u.email || (u.phone && r.guestPhone === u.phone));
                      const userLeads = leads.filter(l => l.email === u.email || (u.phone && l.phone === u.phone));

                      return (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3">
                            <div className="font-semibold text-white flex items-center gap-2 flex-wrap">
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
                            {/* Connected Activity Badges */}
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              {userSubmissions.length > 0 && (
                                <button
                                  onClick={() => jumpToSubmissionsWithOwner(u.name)}
                                  className="text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded hover:underline"
                                  title="Voir les mandats"
                                >
                                  {userSubmissions.length} Mandat(s)
                                </button>
                              )}
                              {userReservations.length > 0 && (
                                <button
                                  onClick={() => jumpToReservationsWithGuest(u.name)}
                                  className="text-[9px] font-mono bg-brand-gold/20 text-brand-gold border border-brand-gold/30 px-1.5 py-0.2 rounded hover:underline"
                                  title="Voir les réservations"
                                >
                                  {userReservations.length} Séjour(s)
                                </button>
                              )}
                              {userLeads.length > 0 && (
                                <button
                                  onClick={() => jumpToCrmWithLead(u.email || u.phone || '')}
                                  className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded hover:underline"
                                  title="Voir les fiches CRM"
                                >
                                  {userLeads.length} Lead(s) CRM
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="p-3 font-mono text-brand-travertine/70">{u.email}</td>
                          <td className="p-3 font-mono text-brand-travertine/60">
                            {u.phone ? (
                              <div className="flex items-center gap-1.5">
                                <span>{u.phone}</span>
                                <a
                                  href={`https://wa.me/${u.phone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-400 hover:text-emerald-300"
                                  title="WhatsApp"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                </a>
                              </div>
                            ) : (
                              '—'
                            )}
                          </td>
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
                      );
                    })}
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
                    <option value="Villa Semi-Construite">Villa Semi-Construite</option>
                    <option value="Espace Commercial">Espace Commercial</option>
                    <option value="Fonds de Commerce">Fonds de Commerce</option>
                    <option value="Appartement">Appartement</option>
                    <option value="Duplex">Duplex</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="Domaine Événementiel">Domaine Événementiel</option>
                  </select>
                </div>
              </div>

              {/* Spécifique Villa Semi-Construite */}
              {propCategory === 'Villa Semi-Construite' && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase">
                    <span>🏗️ Paramètres Villa Semi-Construite</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-amber-300 block mb-1 font-bold">
                        Budget estimé pour achever la construction (TND) *
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={propCompletionEstimate || ''}
                        onChange={(e) => setPropCompletionEstimate(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="ex: 210000"
                        className="w-full bg-brand-navy border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-amber-300 block mb-1 font-bold">
                        Stade actuel des travaux
                      </label>
                      <input
                        type="text"
                        value={propConstructionStage}
                        onChange={(e) => setPropConstructionStage(e.target.value)}
                        placeholder="ex: Gros œuvre achevé (65%)"
                        className="w-full bg-brand-navy border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Spécifique Commercial & Fonds de Commerce */}
              {(propCategory === 'Espace Commercial' || propCategory === 'Fonds de Commerce') && (
                <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase">
                    <span>🏢 Paramètres Actif Commercial</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-sky-300 block mb-1 font-bold">
                        Vocation / Activité autorisée
                      </label>
                      <input
                        type="text"
                        value={propBusinessActivity}
                        onChange={(e) => setPropBusinessActivity(e.target.value)}
                        placeholder="ex: Showroom, Restauration..."
                        className="w-full bg-brand-navy border border-sky-500/30 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-sky-300 block mb-1 font-bold">
                        Loyer murs mensuel (TND/m)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={propMonthlyRent || ''}
                        onChange={(e) => setPropMonthlyRent(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="ex: 2400"
                        className="w-full bg-brand-navy border border-sky-500/30 rounded-xl px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-sky-300 block mb-1 font-bold">
                        Linéaire Vitrine (m)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={propLinearFacade || ''}
                        onChange={(e) => setPropLinearFacade(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="ex: 16"
                        className="w-full bg-brand-navy border border-sky-500/30 rounded-xl px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

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
                    disabled={isUploadingImage}
                    onChange={async (e) => {
                      if (!e.target.files || !e.target.files[0]) return;
                      const file = e.target.files[0];
                      setIsUploadingImage(true);
                      try {
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('bucket', 'properties');
                        const res = await fetch('/api/upload', {
                          method: 'POST',
                          body: formData,
                        });
                        const data = await res.json();
                        if (data.success && data.url) {
                          setPropImageUrl(data.url);
                          showToast(`Image téléversée avec succès (${data.provider === 'supabase' ? 'Supabase Storage' : 'Stockage Sécurisé'})`);
                        } else {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) setPropImageUrl(ev.target.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      } catch (err) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) setPropImageUrl(ev.target.result as string);
                        };
                        reader.readAsDataURL(file);
                      } finally {
                        setIsUploadingImage(false);
                      }
                    }}
                    className="hidden"
                  />
                  <UploadCloud className={`w-6 h-6 text-brand-gold mx-auto ${isUploadingImage ? 'animate-bounce' : ''}`} />
                  <label
                    htmlFor="admin-prop-upload"
                    className="inline-block bg-brand-gold hover:bg-brand-gold-dark text-brand-navy font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow transition-all"
                  >
                    {isUploadingImage ? 'Téléversement en cours...' : 'Charger une photo depuis l\'ordinateur'}
                  </label>
                  <p className="text-[10px] text-white/50 font-mono">Compatible Supabase Storage & Stockage Haute Définition</p>
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
                    placeholder="+216 27 745 403"
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
                    disabled={isUploadingImage}
                    onChange={async (e) => {
                      if (!e.target.files || !e.target.files[0]) return;
                      const file = e.target.files[0];
                      setIsUploadingImage(true);
                      try {
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('bucket', 'articles');
                        const res = await fetch('/api/upload', {
                          method: 'POST',
                          body: formData,
                        });
                        const data = await res.json();
                        if (data.success && data.url) {
                          setArtCoverImage(data.url);
                          showToast(`Image de couverture uploadée (${data.provider === 'supabase' ? 'Supabase Storage' : 'Stockage Sécurisé'})`);
                        } else {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) setArtCoverImage(ev.target.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      } catch (err) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) setArtCoverImage(ev.target.result as string);
                        };
                        reader.readAsDataURL(file);
                      } finally {
                        setIsUploadingImage(false);
                      }
                    }}
                    className="hidden"
                  />
                  <UploadCloud className={`w-6 h-6 text-brand-gold mx-auto ${isUploadingImage ? 'animate-bounce' : ''}`} />
                  <label
                    htmlFor="admin-art-upload"
                    className="inline-block bg-brand-gold hover:bg-brand-gold-dark text-brand-navy font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow transition-all"
                  >
                    {isUploadingImage ? 'Téléversement en cours...' : "Charger l'image de couverture depuis l'ordinateur"}
                  </label>
                  <p className="text-[10px] text-white/50 font-mono">Compatible Supabase Storage & Articles Presse</p>
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

                {/* Spécificités Villa Semi-Construite / Commercial */}
                {(inspectingSubmission.completionEstimate || inspectingSubmission.specificDetails?.completionEstimate) && (
                  <div className="pt-2 border-t border-amber-500/20 bg-amber-500/10 p-3 rounded-lg flex items-center justify-between text-amber-300">
                    <div>
                      <span className="text-[10px] font-mono uppercase block text-amber-400 font-bold">Estimation Travaux d'Achèvement :</span>
                      <span className="font-mono text-xs text-white/70">
                        {inspectingSubmission.constructionStage || inspectingSubmission.specificDetails?.constructionStage || 'En cours de travaux'}
                      </span>
                    </div>
                    <span className="text-base font-bold font-mono text-amber-300">
                      + {(inspectingSubmission.completionEstimate || inspectingSubmission.specificDetails?.completionEstimate || 0).toLocaleString('fr-FR')} TND
                    </span>
                  </div>
                )}

                {(inspectingSubmission.businessActivity || inspectingSubmission.specificDetails?.businessActivity) && (
                  <div className="pt-2 border-t border-sky-500/20 bg-sky-500/10 p-3 rounded-lg flex items-center justify-between text-sky-300">
                    <div>
                      <span className="text-[10px] font-mono uppercase block text-sky-400 font-bold">Vocation Commerciale :</span>
                      <span className="font-mono text-xs text-white/80">
                        {inspectingSubmission.businessActivity || inspectingSubmission.specificDetails?.businessActivity}
                      </span>
                    </div>
                    {(inspectingSubmission.monthlyRentTND || inspectingSubmission.specificDetails?.monthlyRentTND) && (
                      <span className="text-xs font-bold font-mono text-sky-300">
                        Loyer murs: {(inspectingSubmission.monthlyRentTND || inspectingSubmission.specificDetails?.monthlyRentTND || 0).toLocaleString('fr-FR')} TND/mois
                      </span>
                    )}
                  </div>
                )}

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
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setInspectingSubmission(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-mono transition-colors"
                >
                  Fermer l'Aperçu
                </button>

                <button
                  onClick={() => generateSubmissionPdf(inspectingSubmission)}
                  className="px-4 py-2.5 rounded-xl bg-brand-gold text-brand-navy hover:opacity-90 text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
                  title="Générer et télécharger le dossier officiel signé en PDF"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Télécharger Fiche PDF</span>
                </button>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap justify-end">
                {inspectingSubmission.status === 'PENDING' && (
                  <button
                    onClick={() => handleRejectSubmission(inspectingSubmission.id, inspectingSubmission.refCode)}
                    className="px-4 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs font-bold transition-colors"
                  >
                    Refuser le Dossier
                  </button>
                )}

                {inspectingSubmission.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleApproveSubmission(inspectingSubmission, false)}
                      className="px-5 py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow"
                      title="Valider le mandat en interne sans le rendre visible sur le catalogue public"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approuver sans publier</span>
                    </button>
                    <button
                      onClick={() => handleApproveSubmission(inspectingSubmission, true)}
                      className="bg-gradient-to-r from-brand-gold to-brand-gold-dark hover:opacity-95 text-brand-navy font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all"
                      title="Valider et publier directement au catalogue public"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approuver & Publier</span>
                    </button>
                  </>
                )}

                {inspectingSubmission.status === 'APPROVED' && !inspectingSubmission.isPublished && (
                  <button
                    onClick={() => handleApproveSubmission(inspectingSubmission, true)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-brand-navy font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all"
                    title="Mettre en ligne sur le catalogue public Villa Regia"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Publier maintenant au Catalogue</span>
                  </button>
                )}

                {inspectingSubmission.status === 'APPROVED' && inspectingSubmission.isPublished && (
                  <span className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    <span>Dossier approuvé & en ligne au catalogue</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
