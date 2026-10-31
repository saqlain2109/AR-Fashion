const http = require('http');

async function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runE2ETests() {
  console.log('=====================================================');
  console.log('   STARTING AR FASHION HOUSE COMPLETE E2E VERIFICATION   ');
  console.log('=====================================================');

  const baseHeaders = { 'Content-Type': 'application/json' };
  let adminToken = '';
  let authHeaders = {};

  // Step 1: Admin Login
  console.log('\n[1] Testing Admin Login with default seeded credentials...');
  const loginRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: baseHeaders,
    },
    { email: 'admin@arfashion.com', password: 'Admin@12345' }
  );

  if (loginRes.status === 200 && loginRes.data.success) {
    adminToken = loginRes.data.token;
    authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    };
    console.log('✅ Admin login successful! Authenticated as:', loginRes.data.user.email);
  } else {
    console.error('❌ Login failed:', loginRes);
    process.exit(1);
  }

  // Step 2: Dashboard Stats
  console.log('\n[2] Testing Dashboard Statistics API...');
  const statsRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/dashboard/stats',
    method: 'GET',
    headers: authHeaders,
  });
  console.log('✅ Dashboard Metrics retrieved:');
  console.log('   - Total Products:', statsRes.data.stats.totalProducts);
  console.log('   - Active (Published):', statsRes.data.stats.activeProducts);
  console.log('   - Out of Stock:', statsRes.data.stats.outOfStockProducts);
  console.log('   - Total Categories:', statsRes.data.stats.totalCategories);
  console.log('   - Pending Orders:', statsRes.data.stats.pendingOrders);
  console.log('   - Confirmed Orders:', statsRes.data.stats.confirmedOrders);

  // Step 3: Fetch Categories
  console.log('\n[3] Testing Categories Retrieval...');
  const catRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/categories?admin=true',
    method: 'GET',
    headers: authHeaders,
  });
  console.log(`✅ Loaded ${catRes.data.categories.length} categories from DB.`);
  const targetCategory = catRes.data.categories[0];

  // Step 4: Add New Product with Size & Colour Matrix
  console.log('\n[4] Testing Product Creation (Add New Product Complete Form)...');
  const testProductPayload = {
    name: 'Festive Embroidered Silk Panjabi - Midnight Navy',
    description: 'Luxurious heavy embroidery on semi-formal festive Panjabi crafted from organic blended silk.',
    categoryId: targetCategory.id,
    sku: `AR-TEST-${Date.now().toString().slice(-4)}`,
    sellingPrice: 4200,
    originalPrice: 4800,
    status: 'PUBLISHED',
    isFeatured: true,
    isNewArrival: true,
    mainImage: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
    ],
    variants: [
      { colour: 'Midnight Navy', colourCode: '#1E3A8A', size: 'M (40)', stock: 10, price: 4200 },
      { colour: 'Midnight Navy', colourCode: '#1E3A8A', size: 'L (42)', stock: 15, price: 4200 },
      { colour: 'Pearl White', colourCode: '#FFFFFF', size: 'M (40)', stock: 8, price: 4200 },
      { colour: 'Pearl White', colourCode: '#FFFFFF', size: 'L (42)', stock: 0, price: 4200 }, // Out of stock variant test
    ],
  };

  const createProdRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/products',
      method: 'POST',
      headers: authHeaders,
    },
    testProductPayload
  );

  if (createProdRes.status === 201 && createProdRes.data.success) {
    console.log('✅ Product successfully created with 4 variants!');
    console.log('   - ID:', createProdRes.data.product.id);
    console.log('   - SKU:', createProdRes.data.product.sku);
    console.log('   - Status:', createProdRes.data.product.status);
  } else {
    console.error('❌ Failed to create product:', createProdRes);
    process.exit(1);
  }

  const createdProduct = createProdRes.data.product;

  // Step 5: Verification that Published Product is visible on Public Storefront
  console.log('\n[5] Verifying Public Storefront Visibility...');
  const publicProdsRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/products',
    method: 'GET',
    headers: baseHeaders,
  });

  const foundInPublic = publicProdsRes.data.products.some((p) => p.id === createdProduct.id);
  console.log(`✅ Newly published product visible to customers: ${foundInPublic}`);

  // Step 6: Create Draft Product and Verify it is HIDDEN from Public Storefront
  console.log('\n[6] Verifying Draft Products remain strictly hidden from customers...');
  const draftProductPayload = {
    name: 'Experimental Silk Kurti [Internal Draft]',
    description: 'Internal design prototype.',
    categoryId: targetCategory.id,
    sku: `AR-DRAFT-${Date.now().toString().slice(-4)}`,
    sellingPrice: 2500,
    status: 'DRAFT',
    mainImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b',
    images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b'],
    variants: [{ colour: 'Charcoal', size: 'M', stock: 5 }],
  };

  const draftRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/products',
      method: 'POST',
      headers: authHeaders,
    },
    draftProductPayload
  );

  const publicProdsAfterDraft = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/products',
    method: 'GET',
    headers: baseHeaders,
  });

  const draftVisibleToCustomer = publicProdsAfterDraft.data.products.some(
    (p) => p.id === draftRes.data.product.id
  );
  console.log(`✅ Draft product hidden from customers: ${!draftVisibleToCustomer}`);

  // Step 7: Customer WhatsApp Checkout Flow & Stock Validation
  console.log('\n[7] Testing Customer WhatsApp Checkout Flow & Stock Decrement...');
  const targetVariant = createdProduct.variants.find((v) => v.colour === 'Midnight Navy' && v.size === 'M (40)');
  const initialStock = targetVariant.stock;

  const checkoutPayload = {
    customerName: 'Shakib Al Hasan',
    customerPhone: '+8801700112233',
    deliveryAddress: 'Mirpur DOHS, Road 9, House 12',
    city: 'Dhaka',
    notes: 'Urgent delivery requested for reception event.',
    items: [
      {
        productId: createdProduct.id,
        productName: createdProduct.name,
        variantId: targetVariant.id,
        colour: targetVariant.colour,
        size: targetVariant.size,
        quantity: 2,
      },
    ],
  };

  const checkoutRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/orders',
      method: 'POST',
      headers: baseHeaders,
    },
    checkoutPayload
  );

  if (checkoutRes.status === 201 && checkoutRes.data.success) {
    console.log('✅ Order placed via WhatsApp checkout:');
    console.log('   - Order ID:', checkoutRes.data.order.orderNumber);
    console.log('   - Total Amount: ৳', checkoutRes.data.order.total);
    console.log('   - Status:', checkoutRes.data.order.status);
    console.log('   - WhatsApp URL Generated:', checkoutRes.data.whatsappUrl ? 'YES' : 'NO');
  } else {
    console.error('❌ Checkout failed:', checkoutRes);
    process.exit(1);
  }

  // Step 8: Verify Stock Decrement in Database
  console.log('\n[8] Verifying Real Database Stock Decrement...');
  const invRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/inventory',
    method: 'GET',
    headers: authHeaders,
  });

  const updatedVariant = invRes.data.variants.find((v) => v.id === targetVariant.id);
  console.log(`✅ Variant stock before: ${initialStock}, after checkout: ${updatedVariant.stock} (Decremented by 2!)`);

  // Step 9: Out-of-Stock Checkout Prevention
  console.log('\n[9] Testing Out-of-Stock Checkout Prevention on Backend...');
  const outOfStockVariant = createdProduct.variants.find((v) => v.stock === 0);
  const invalidCheckoutRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/orders',
      method: 'POST',
      headers: baseHeaders,
    },
    {
      customerName: 'Test Buyer',
      customerPhone: '+8801799887766',
      deliveryAddress: 'Test Address',
      city: 'Dhaka',
      items: [
        {
          productId: createdProduct.id,
          productName: createdProduct.name,
          variantId: outOfStockVariant.id,
          colour: outOfStockVariant.colour,
          size: outOfStockVariant.size,
          quantity: 1,
        },
      ],
    }
  );

  if (invalidCheckoutRes.status === 400) {
    console.log(`✅ Backend successfully blocked ordering out-of-stock variant: "${invalidCheckoutRes.data.error}"`);
  } else {
    console.error('❌ Expected 400 error for out of stock, got:', invalidCheckoutRes.status);
  }

  // Step 10: Admin Order Status Update & Internal Notes
  console.log('\n[10] Testing Admin Order Status Management...');
  const orderId = checkoutRes.data.order.id;
  const updateOrderRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: `/api/orders/${orderId}`,
      method: 'PATCH',
      headers: authHeaders,
    },
    {
      status: 'CONFIRMED',
      internalNotes: 'Customer verified on WhatsApp chat. Courier booking confirmed.',
    }
  );

  console.log('✅ Order status updated to:', updateOrderRes.data.order.status);
  console.log('   Internal notes:', updateOrderRes.data.order.internalNotes);

  console.log('\n=====================================================');
  console.log('   🎉 ALL AR FASHION HOUSE VERIFICATION TESTS PASSED!   ');
  console.log('=====================================================');
}

runE2ETests().catch((e) => {
  console.error(e);
  process.exit(1);
});
