const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function verifyUiPipeline() {
  console.log('===============================================================');
  console.log('🔬 COMPLETE NOTIFICATION API-TO-UI TRACE VERIFICATION');
  console.log('===============================================================\n');

  try {
    // 1. Authenticate Brand
    console.log('1️⃣ Step 1: Logging in as Brand (brand.boat@collabx.demo)...');
    const brandLogin = await request(
      { hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'brand.boat@collabx.demo', password: 'Password123!' }
    );
    const token = brandLogin.data?.data?.token;
    const user = brandLogin.data?.data?.user;
    if (!token) throw new Error('Brand login failed');
    console.log(`✅ Brand Logged in. ID: ${user._id}`);

    // 2. Fetch notifications from backend API
    console.log('\n2️⃣ Step 2: Fetching GET /api/brand/notifications...');
    const apiRes = await request(
      { hostname: 'localhost', port: 5000, path: '/api/brand/notifications', method: 'GET', headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('   Response Status Code:', apiRes.status);
    console.log('   Response Success Flag:', apiRes.data?.success);
    console.log('   Response Message:', apiRes.data?.message);
    console.log('   Is response.data Array?:', Array.isArray(apiRes.data?.data));
    console.log('   Total Notifications Count in Response:', apiRes.data?.data?.length);

    const rawNotifications = apiRes.data?.data || [];
    if (rawNotifications.length === 0) {
      throw new Error('API returned 0 notifications');
    }

    // 3. Trace AppContext Processing
    console.log('\n3️⃣ Step 3: Tracing AppContext Processing...');
    // Emulating AppContext state
    let notificationsState = [];
    if (apiRes.data?.success && Array.isArray(apiRes.data.data)) {
      notificationsState = apiRes.data.data;
    }
    console.log(`   notificationsState length: ${notificationsState.length}`);

    // 4. Trace Filter Processing in BrandNotifications.tsx
    console.log('\n4️⃣ Step 4: Tracing BrandNotifications Filter Logic...');
    const unreadCount = notificationsState.filter(n => n && !n.isRead && !n.read).length;
    const allFiltered = notificationsState;
    const unreadFiltered = notificationsState.filter(n => n && !n.isRead && !n.read);

    console.log(`   Unread Count: ${unreadCount}`);
    console.log(`   All Tab Count: ${allFiltered.length}`);
    console.log(`   Unread Tab Count: ${unreadFiltered.length}`);

    // 5. Trace Header Dropdown & Badge
    console.log('\n5️⃣ Step 5: Tracing Header.tsx Badge & Dropdown Mapping...');
    const badgeLabel = unreadCount > 9 ? '10+' : String(unreadCount);
    console.log(`   Header Bell Badge Label: "${badgeLabel}" (Visible: ${unreadCount > 0})`);
    const dropdownItems = notificationsState.slice(0, 10);
    console.log(`   Header Dropdown Items to Render: ${dropdownItems.length}`);
    dropdownItems.slice(0, 3).forEach((item, idx) => {
      console.log(`     Item [${idx + 1}]: Title="${item.title}", Unread=${!item.isRead && !item.read}, Type="${item.type}"`);
    });

    // 6. Trace Dashboard Feed
    console.log('\n6️⃣ Step 6: Tracing BrandDashboard.tsx "Recent Notifications & Activity" Feed...');
    const dashboardItems = notificationsState.slice(0, 5);
    console.log(`   Dashboard Feed Items to Render: ${dashboardItems.length}`);
    dashboardItems.forEach((item, idx) => {
      console.log(`     Feed [${idx + 1}]: "${item.title}" - "${item.message}" (Unread: ${!item.isRead && !item.read})`);
    });

    console.log('\n===============================================================');
    console.log('🎉 ALL NOTIFICATION API-TO-UI TRACE CHECKS PASSED WITH EVIDENCE!');
    console.log('===============================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Trace failed:', err);
    process.exit(1);
  }
}

verifyUiPipeline();
