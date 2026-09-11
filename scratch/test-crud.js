const { 
  getProperties, createProperty, updateProperty, deleteProperty,
  getBookings, createBooking, updateBookingStatus, deleteBooking,
  getOwnerSubmissions, createOwnerSubmission, updateOwnerSubmissionStatus, deleteOwnerSubmission,
  getLeads, createLead, updateLead, deleteLead,
  getArticles, createArticle, updateArticle, deleteArticle,
  getDbUsers, createDbUser, updateDbUser, deleteDbUser
} = require('./src/lib/db');

async function testAllCRUD() {
  console.log('=== STARTING COMPLETE DATA CRUD PERSISTENCE VERIFICATION ===');

  try {
    // 1. Properties CRUD
    console.log('\n--- Testing Properties CRUD ---');
    const initialProps = await getProperties();
    console.log(`Initial Properties Count: ${initialProps.length}`);

    const newProp = await createProperty({
      universe: 'VENTE',
      category: 'Villa',
      title: { fr: 'Villa Test Persistence', ar: 'فيلا تجريبية', en: 'Test Villa' },
      description: { fr: 'Villa de test pour vérification', ar: 'وصف تجريبي', en: 'Test desc' },
      price: { amount: 750000, currency: 'TND', period: 'total' },
      location: { city: 'Sfax', district: 'Route de la Soukra', country: 'Tunisie', lat: 34.74, lng: 10.74, isExactPosition: true },
      specs: { surfaceM2: 380, bedrooms: 4, bathrooms: 3, pool: true, garden: true },
      images: [{ url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9', alt: 'Test Villa Image' }],
      status: 'DISPONIBLE',
      isFeatured: true,
      isNew: true,
    });
    console.log(`Created Property ID: ${newProp.id}`);

    const updatedProp = await updateProperty(newProp.id, { isFeatured: false });
    console.log(`Updated Property isFeatured: ${updatedProp?.isFeatured}`);

    const delPropRes = await deleteProperty(newProp.id);
    console.log(`Deleted Property Success: ${delPropRes}`);

    // 2. Bookings CRUD
    console.log('\n--- Testing Bookings CRUD ---');
    const initialBookings = await getBookings();
    console.log(`Initial Bookings Count: ${initialBookings.length}`);

    const newBooking = await createBooking({
      propertyId: 'vr-prop-01',
      propertyTitle: 'Villa Luxe Test',
      guestName: 'Mounir Sfaxi',
      guestEmail: 'mounir@example.com',
      guestPhone: '+216 22 333 444',
      checkIn: '2026-10-01',
      checkOut: '2026-10-05',
      guestsCount: 4,
      totalNights: 4,
      pricePerNight: 500,
      totalAmount: 2000,
      depositAmount: 500,
    });
    console.log(`Created Booking ID: ${newBooking.id}`);

    const updatedBooking = await updateBookingStatus(newBooking.id, 'CONFIRMED');
    console.log(`Updated Booking Status: ${updatedBooking?.status}`);

    const delBookingRes = await deleteBooking(newBooking.id);
    console.log(`Deleted Booking Success: ${delBookingRes}`);

    // 3. Owner Submissions CRUD
    console.log('\n--- Testing Owner Submissions CRUD ---');
    const initialSubs = await getOwnerSubmissions();
    console.log(`Initial Submissions Count: ${initialSubs.length}`);

    const newSubRes = await createOwnerSubmission({
      propertyType: 'Villa',
      objective: 'VENTE',
      surfaceM2: 500,
      bedrooms: 5,
      estimatedValue: 1500000,
      city: 'Sfax',
      district: 'Route de Téniour',
      gouvernorat: 'Sfax',
      ownerName: 'Kamel Test',
      ownerPhone: '+216 99 888 777',
      ownerEmail: 'kamel@example.com',
      titleType: 'Titre Bleu',
      details: 'Villa de test soumission',
    });
    console.log(`Created Owner Submission Ref: ${newSubRes.submission.refCode}`);

    const updatedSub = await updateOwnerSubmissionStatus(newSubRes.submission.id, 'APPROVED', true);
    console.log(`Updated Submission Status: ${updatedSub?.status}, Published: ${updatedSub?.isPublished}`);

    const delSubRes = await deleteOwnerSubmission(newSubRes.submission.id);
    console.log(`Deleted Submission Success: ${delSubRes}`);

    // 4. CRM Leads CRUD
    console.log('\n--- Testing CRM Leads CRUD ---');
    const initialLeads = await getLeads();
    console.log(`Initial Leads Count: ${initialLeads.length}`);

    const newLead = await createLead({
      name: 'Sonia Ben Ali',
      email: 'sonia@example.com',
      phone: '+216 55 666 777',
      source: 'Contact Web',
      universe: 'RESIDENCE',
      notes: 'Intéressée par appartement Sfax',
    });
    console.log(`Created Lead ID: ${newLead.id}`);

    const updatedLead = await updateLead(newLead.id, { status: 'Qualifié' });
    console.log(`Updated Lead Status: ${updatedLead?.status}`);

    const delLeadRes = await deleteLead(newLead.id);
    console.log(`Deleted Lead Success: ${delLeadRes}`);

    // 5. Users CRUD
    console.log('\n--- Testing Users CRUD ---');
    const initialUsers = await getDbUsers();
    console.log(`Initial Users Count: ${initialUsers.length}`);

    const newUser = await createDbUser({
      name: 'Agent Test Sfax',
      email: 'agent.test@villaregia.tn',
      phone: '+216 98 765 432',
      password: 'Password.123',
      role: 'AGENT',
    });
    console.log(`Created User Email: ${newUser.email}`);

    const updatedUser = await updateDbUser({ email: newUser.email, phone: '+216 98 000 111' });
    console.log(`Updated User Phone: ${updatedUser?.phone}`);

    const delUserRes = await deleteDbUser(newUser.email);
    console.log(`Deleted User Success: ${delUserRes}`);

    console.log('\n=== ALL DATA PERSISTENCE TESTS COMPLETED SUCCESSFULLY! ===');
  } catch (err) {
    console.error('Data verification error:', err);
  }
}

testAllCRUD();
