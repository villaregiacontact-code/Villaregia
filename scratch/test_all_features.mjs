import http from 'http';

const BASE_URL = 'http://localhost:3005';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const config = { method: options.method || 'GET', headers };
  if (options.body) config.body = JSON.stringify(options.body);

  const res = await fetch(url, config);
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function runAllTests() {
  console.log('====================================================');
  console.log('   STARTING VILLA REGIA COMPREHENSIVE TEST SUITE    ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASSED: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAILED: ${message}`);
      failed++;
    }
  }

  try {
    // 1. PROPERTIES API TESTS
    console.log('\n--- 1. Testing Properties API ---');
    const getProps = await request('/api/properties');
    assert(getProps.ok && getProps.data?.success && Array.isArray(getProps.data?.properties), 'GET /api/properties returns property list');

    const testPropPayload = {
      universe: 'VENTE',
      category: 'Villa',
      title: { fr: 'Villa Test Automated', ar: 'فيلار تجريبية', en: 'Villa Test' },
      description: { fr: 'Description de test automatique', ar: 'وصف', en: 'Description' },
      price: { amount: 1250000, currency: 'TND' },
      location: { city: 'Sfax', district: 'Route de la Soukra' },
      specs: { surfaceM2: 450, bedrooms: 5, bathrooms: 4, pool: true, garden: true },
      images: [{ url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9', alt: 'Test' }],
      status: 'DISPONIBLE',
    };

    const createProp = await request('/api/properties', { method: 'POST', body: testPropPayload });
    assert(createProp.status === 201 && createProp.data?.success && createProp.data?.property?.id, 'POST /api/properties creates a new property');

    const createdPropId = createProp.data?.property?.id;
    if (createdPropId) {
      const getSingleProp = await request(`/api/properties/${createdPropId}`);
      assert(getSingleProp.ok && getSingleProp.data?.property?.id === createdPropId, `GET /api/properties/${createdPropId} retrieves the property`);

      const updateProp = await request(`/api/properties/${createdPropId}`, {
        method: 'PUT',
        body: { status: 'RESERVE' },
      });
      assert(updateProp.ok && updateProp.data?.property?.status === 'RESERVE', 'PUT /api/properties/[id] updates property status');

      const deleteProp = await request(`/api/properties/${createdPropId}`, { method: 'DELETE' });
      assert(deleteProp.ok && deleteProp.data?.success, 'DELETE /api/properties/[id] deletes property');
    }

    // 2. OWNER SUBMISSIONS ("Proposer un bien") API TESTS
    console.log('\n--- 2. Testing Owner Submissions ("Proposer un bien") ---');
    const subPayload = {
      propertyType: 'Villa',
      objective: 'VENTE',
      surfaceM2: 500,
      bedrooms: 4,
      estimatedValue: 950000,
      gouvernorat: 'Sfax',
      city: 'Sfax Ville',
      district: 'Route Menzel Chaker',
      ownerName: 'Test Owner Auto',
      ownerPhone: '+216 98 123 456',
      ownerEmail: 'test.owner.auto@villaregia.tn',
      titleType: 'Titre Bleu Individuel',
      details: 'Test submission automated',
    };

    const createSub = await request('/api/submissions', { method: 'POST', body: subPayload });
    assert(createSub.status === 201 && createSub.data?.success && createSub.data?.submission?.refCode, 'POST /api/submissions creates owner submission & lead');

    const subId = createSub.data?.submission?.id;
    const getSubs = await request('/api/submissions');
    assert(getSubs.ok && getSubs.data?.submissions?.some(s => s.ownerEmail === 'test.owner.auto@villaregia.tn'), 'GET /api/submissions fetches updated submissions list');

    if (subId) {
      const patchSub = await request('/api/submissions', {
        method: 'PATCH',
        body: { id: subId, status: 'APPROVED', isPublished: true },
      });
      assert(patchSub.ok && patchSub.data?.submission?.status === 'APPROVED', 'PATCH /api/submissions updates submission status to APPROVED');
    }

    // 3. BOOKINGS (Villas Luxe) API TESTS
    console.log('\n--- 3. Testing Bookings API ---');
    const bookingPayload = {
      propertyId: 'vr-prop-demo-01',
      propertyTitle: 'Villa Carthage Luxe',
      guestName: 'Voyageur Test',
      guestEmail: 'voyageur.test@villaregia.tn',
      guestPhone: '+216 97 000 111',
      checkIn: '2026-10-01',
      checkOut: '2026-10-05',
      guestsCount: 4,
      totalAmount: 3200,
    };

    const createBook = await request('/api/bookings', { method: 'POST', body: bookingPayload });
    assert(createBook.status === 201 && createBook.data?.success && createBook.data?.booking?.id, 'POST /api/bookings creates booking & CRM lead');

    const bookId = createBook.data?.booking?.id;
    const getBookings = await request('/api/bookings');
    assert(getBookings.ok && getBookings.data?.bookings?.some(b => b.guestEmail === 'voyageur.test@villaregia.tn'), 'GET /api/bookings lists the new booking');

    if (bookId) {
      const patchBook = await request(`/api/bookings/${bookId}`, {
        method: 'PATCH',
        body: { status: 'CONFIRMED' },
      });
      assert(patchBook.ok && patchBook.data?.booking?.status === 'CONFIRMED', 'PATCH /api/bookings/[id] updates booking status to CONFIRMED');
    }

    // 4. USERS & STAFF MANAGEMENT API TESTS
    console.log('\n--- 4. Testing Users & Staff Management API ---');
    const testStaffEmail = `staff.test.${Date.now()}@villaregia.tn`;
    const createStaffPayload = {
      name: 'Agent Commercial Test',
      email: testStaffEmail,
      role: 'AGENT',
      password: 'TestPassword123',
      phone: '+216 99 888 777',
      twoFactorEnabled: false,
    };

    const createStaff = await request('/api/admin/users', { method: 'POST', body: createStaffPayload });
    assert(createStaff.ok && createStaff.data?.success && createStaff.data?.user?.email === testStaffEmail, 'POST /api/admin/users creates new staff account');

    const getUsers = await request('/api/admin/users');
    assert(getUsers.ok && getUsers.data?.users?.some(u => u.email === testStaffEmail), 'GET /api/admin/users fetches updated user list from disk');

    const staffId = createStaff.data?.user?.id;
    if (staffId) {
      const updateStaff = await request('/api/admin/users', {
        method: 'PUT',
        body: { id: staffId, email: testStaffEmail, name: 'Agent Commercial Modifié', role: 'ADMIN' },
      });
      assert(updateStaff.ok && updateStaff.data?.user?.role === 'ADMIN', 'PUT /api/admin/users updates user role & name');

      const deleteStaff = await request(`/api/admin/users?email=${encodeURIComponent(testStaffEmail)}&id=${staffId}`, { method: 'DELETE' });
      assert(deleteStaff.ok && deleteStaff.data?.success, 'DELETE /api/admin/users removes user account');
    }

    // 5. AUTHENTICATION (LOGIN, REGISTER, PROFILE) API TESTS
    console.log('\n--- 5. Testing Authentication API ---');
    const loginSuperAdmin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'yassinealoulou6@gmail.com', password: 'Yassine.123' },
    });
    assert(loginSuperAdmin.ok && loginSuperAdmin.data?.success && loginSuperAdmin.data?.user?.role === 'SUPER_ADMIN', 'POST /api/auth/login logs in Super Admin');

    const clientRegEmail = `client.auto.${Date.now()}@villaregia.tn`;
    const regClient = await request('/api/auth/register', {
      method: 'POST',
      body: { name: 'Client Auto', email: clientRegEmail, phone: '+216 27 000 000', role: 'CLIENT', password: 'Password123' },
    });
    assert(regClient.ok && regClient.data?.success, 'POST /api/auth/register registers new Client');

    // 6. INQUIRIES & CONTACT API TESTS
    console.log('\n--- 6. Testing Inquiries / Contact API ---');
    const inquiryPayload = {
      name: 'Prospect Contact Test',
      email: 'prospect.contact@villaregia.tn',
      phone: '+216 98 765 432',
      source: 'Page Contact',
      universe: 'LUXE',
      propertyTitle: 'Demande Villa Luxe',
      message: 'Je souhaite réserver une villa avec chef cuisinier.',
    };

    const createInquiry = await request('/api/inquiries', { method: 'POST', body: inquiryPayload });
    assert(createInquiry.status === 201 && createInquiry.data?.success && createInquiry.data?.lead?.id, 'POST /api/inquiries creates a CRM Lead');

    // 7. CRM & STATS API TESTS
    console.log('\n--- 7. Testing CRM & Admin Stats API ---');
    const getCrm = await request('/api/admin/crm');
    assert(getCrm.ok && getCrm.data?.success && Array.isArray(getCrm.data?.leads), 'GET /api/admin/crm fetches leads list');

    const getStats = await request('/api/admin/stats');
    assert(getStats.ok && getStats.data?.success && getStats.data?.stats?.totalProperties !== undefined, 'GET /api/admin/stats returns aggregate stats');

    // 8. ARTICLES / JOURNAL BLOG API TESTS
    console.log('\n--- 8. Testing Journal Articles API ---');
    const getArticles = await request('/api/articles');
    assert(getArticles.ok && getArticles.data?.success && Array.isArray(getArticles.data?.articles), 'GET /api/articles fetches blog posts');

    const articlePayload = {
      title: 'Guide de l\'Investissement Immobilier à Sfax 2026 Test',
      category: 'Investissement',
      excerpt: 'Les meilleures opportunités d\'investissement à Sfax.',
      content: 'Contenu détaillé sur le marché immobilier de Sfax.',
    };
    const createArticle = await request('/api/articles', { method: 'POST', body: articlePayload });
    assert(createArticle.status === 201 && createArticle.data?.success && createArticle.data?.article?.slug, 'POST /api/articles publishes new article');

    const artSlug = createArticle.data?.article?.slug;
    if (artSlug) {
      const getSingleArt = await request(`/api/articles/${artSlug}`);
      assert(getSingleArt.ok && getSingleArt.data?.article?.slug === artSlug, 'GET /api/articles/[slug] fetches single article');

      const deleteArt = await request(`/api/articles/${artSlug}`, { method: 'DELETE' });
      assert(deleteArt.ok && deleteArt.data?.success, 'DELETE /api/articles/[slug] deletes article');
    }

  } catch (err) {
    console.error('Test execution error:', err);
  }

  console.log('\n====================================================');
  console.log(`   TEST RESULTS SUMMARY: ${passed} PASSED | ${failed} FAILED   `);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests();
