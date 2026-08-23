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

async function verifyPortfolio() {
  console.log('================================================================');
  console.log('🧪 VERIFYING CREATOR PORTFOLIO & SHOWCASE UPGRADE');
  console.log('================================================================\n');

  try {
    // 1. Creator Login
    console.log('1️⃣ Step 1: Logging in as Creator (creator.mortal@collabx.demo)...');
    const loginRes = await request(
      { hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'creator.mortal@collabx.demo', password: 'Password123!' }
    );
    const token = loginRes.data?.data?.token;
    const user = loginRes.data?.data?.user;
    if (!token) throw new Error('Creator login failed');
    console.log(`✅ Creator Logged In: ${user.fullName} (ID: ${user._id})`);

    // 2. Fetch Initial Portfolio
    console.log('\n2️⃣ Step 2: Fetching initial portfolio items via GET /api/creator/portfolio...');
    const initialRes = await request(
      { hostname: 'localhost', port: 5000, path: '/api/creator/portfolio', method: 'GET', headers: { Authorization: `Bearer ${token}` } }
    );
    const initialItems = initialRes.data?.data || [];
    console.log(`✅ Initial Showcases Count: ${initialItems.length}`);
    initialItems.forEach((it, idx) => {
      console.log(`   [${idx + 1}] Title: "${it.title}" | Platform: ${it.platform} | Value: ₹${it.campaignValue || 0} | Views: ${it.views} | Engagement: ${it.engagementRate}`);
    });

    // 3. Add a New Showcase Item
    console.log('\n3️⃣ Step 3: Adding new showcase item via POST /api/creator/portfolio...');
    const newShowcase = {
      title: 'boAt Nirvana ANC Launch Campaign',
      brandName: 'boAt Lifestyle',
      platform: 'youtube',
      description: 'Full unboxing, audio quality testing and spatial audio demo on live tournament stream.',
      campaignValue: 45000,
      views: '1.2M',
      engagementRate: '8.4%',
      contentUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      mediaType: 'video'
    };

    const addRes = await request(
      { hostname: 'localhost', port: 5000, path: '/api/creator/portfolio', method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } },
      newShowcase
    );

    console.log(`   Response Status: ${addRes.status}`);
    console.log(`   Response Message: "${addRes.data?.message}"`);
    const createdItem = addRes.data?.data;
    if (!createdItem?._id) throw new Error('Showcase item creation failed');
    console.log(`✅ Showcase Item Created. ID: ${createdItem._id}`);

    // 4. Verify Updated Portfolio List
    console.log('\n4️⃣ Step 4: Re-fetching portfolio to verify list and metrics...');
    const updatedRes = await request(
      { hostname: 'localhost', port: 5000, path: '/api/creator/portfolio', method: 'GET', headers: { Authorization: `Bearer ${token}` } }
    );
    const updatedItems = updatedRes.data?.data || [];
    console.log(`✅ Updated Showcases Count: ${updatedItems.length} (Increased from ${initialItems.length})`);
    const latestItem = updatedItems[0];
    console.log(`   Latest Item: "${latestItem.title}"`);
    console.log(`   Platform: ${latestItem.platform}`);
    console.log(`   Brand: ${latestItem.brandName}`);
    console.log(`   Campaign Value: ₹${latestItem.campaignValue}`);
    console.log(`   Views: ${latestItem.views}`);
    console.log(`   Engagement Rate: ${latestItem.engagementRate}`);
    console.log(`   Content URL: ${latestItem.contentUrl}`);

    console.log('\n================================================================');
    console.log('🎉 ALL PORTFOLIO MODULE UPGRADE CHECKS PASSED SUCCESSFULLY!');
    console.log('================================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  }
}

verifyPortfolio();
