import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log('🌱 Seeding MySQL Database with FarmDirect demo entities...');

  // 1. Password Hashes (10 rounds bcrypt)
  const consumerPasswordHash = await bcrypt.hash('DemoConsumer123!', 10);
  const farmerPasswordHash = await bcrypt.hash('DemoFarmer123!', 10);

  // 2. Clean existing records if any
  await prisma.favorite.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productTransparency.deleteMany();
  await prisma.product.deleteMany();
  await prisma.farmerProfile.deleteMany();
  await prisma.consumerProfile.deleteMany();
  await prisma.user.deleteMany();

  // 3. Create Demo Consumer (Arun Kumar)
  const consumerUser = await prisma.user.create({
    data: {
      name: 'Arun Kumar',
      email: 'arun@example.com',
      passwordHash: consumerPasswordHash,
      phone: '+91 98402 12345',
      role: 'CONSUMER',
      consumerProfile: {
        create: {
          location: 'Salem, Tamil Nadu'
        }
      }
    },
    include: {
      consumerProfile: true
    }
  });

  console.log(`✅ Seeded Consumer: ${consumerUser.name} (${consumerUser.email})`);

  // 4. Create Demo Farmer (Ravi / Ravi Farms - VERIFIED)
  const farmerUser = await prisma.user.create({
    data: {
      name: 'Ravi',
      email: 'ravi@farmdirect.example',
      passwordHash: farmerPasswordHash,
      phone: '+91 94431 87654',
      role: 'FARMER',
      farmerProfile: {
        create: {
          farmName: 'Ravi Farms',
          location: 'Salem, Tamil Nadu',
          description: 'Sustainable agro-ecology farm cultivating fresh vegetables, heritage grains, coconuts, and natural raw honey.',
          farmAcreage: 12.0,
          verified: true,
          verificationStatus: 'VERIFIED'
        }
      }
    },
    include: {
      farmerProfile: true
    }
  });

  console.log(`✅ Seeded Verified Farmer: ${farmerUser.name} (${farmerUser.farmerProfile.farmName})`);

  // 5. Seed Realistic Demo Products (Section 31)
  const farmerProfileId = farmerUser.farmerProfile.id;

  const productsData = [
    {
      name: 'Fresh Country Tomatoes',
      category: 'VEGETABLES',
      description: 'Vine-ripened indigenous country tomatoes harvested at peak flavor with balanced acidity and deep red color.',
      price: 40.0,
      unit: 'kg',
      quantity: 120,
      availableQuantity: 90,
      location: 'Salem, Tamil Nadu',
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
      status: 'ACTIVE',
      transparency: {
        harvestDate: new Date('2026-09-17'),
        packingDate: new Date('2026-09-18'),
        expiryDate: new Date('2026-09-28'),
        origin: 'Plot 4, Ravi Farms, Omalur Block, Salem',
        batchNumber: 'TOM-2026-0917',
        ingredients: '100% Native Country Tomato'
      }
    },
    {
      name: 'Farm Fresh Robusta Bananas',
      category: 'FRUITS',
      description: 'Naturally tree-ripened heritage bananas with high natural sweetness and potassium. Grown without ripening chemicals.',
      price: 60.0,
      unit: 'dozen',
      quantity: 80,
      availableQuantity: 65,
      location: 'Salem, Tamil Nadu',
      imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80',
      status: 'ACTIVE',
      transparency: {
        harvestDate: new Date('2026-09-16'),
        packingDate: new Date('2026-09-17'),
        expiryDate: new Date('2026-09-24'),
        origin: 'Grove Sector B, Ravi Farms, Salem',
        batchNumber: 'BAN-2026-0916',
        ingredients: '100% Tree-Ripened Banana'
      }
    },
    {
      name: 'Single-Origin Sona Masoori Rice',
      category: 'GRAINS',
      description: 'Aromatic unpolished medium grain paddy rice, naturally cured and de-husked with bran layer intact.',
      price: 75.0,
      unit: 'kg',
      quantity: 200,
      availableQuantity: 180,
      location: 'Salem, Tamil Nadu',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
      status: 'ACTIVE',
      transparency: {
        harvestDate: new Date('2026-08-20'),
        packingDate: new Date('2026-09-02'),
        expiryDate: new Date('2027-04-30'),
        origin: 'East Rainfed Parcel, Salem',
        batchNumber: 'RIC-2026-0820',
        ingredients: '100% Single-Origin Paddy Rice'
      }
    },
    {
      name: 'Natural Raw Wildflower Honey',
      category: 'HONEY',
      description: 'Pure cold-strained raw honey extracted from mountain-facing hives. Unheated and unpasteurized.',
      price: 250.0,
      unit: '500g',
      quantity: 50,
      availableQuantity: 42,
      location: 'Salem, Tamil Nadu',
      imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
      status: 'ACTIVE',
      transparency: {
        harvestDate: new Date('2026-09-01'),
        packingDate: new Date('2026-09-05'),
        expiryDate: new Date('2027-09-01'),
        origin: 'Apiary Section 1, Ravi Farms, Salem',
        batchNumber: 'HNY-2026-0901',
        ingredients: '100% Pure Raw Honey'
      }
    },
    {
      name: 'Pasture-Raised Country Eggs',
      category: 'EGGS',
      description: 'Rich amber-yolked eggs laid by native hens free-ranging on open grassland. Fed organic grains and natural greens.',
      price: 85.0,
      unit: 'pack of 6',
      quantity: 60,
      availableQuantity: 60,
      location: 'Salem, Tamil Nadu',
      imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80',
      status: 'ACTIVE',
      transparency: {
        harvestDate: new Date('2026-09-18'),
        packingDate: new Date('2026-09-18'),
        expiryDate: new Date('2026-10-08'),
        origin: 'Free Range Pasture Sector, Ravi Farms, Salem',
        batchNumber: 'EGG-2026-0918',
        ingredients: '100% Free-Range Desi Country Eggs'
      }
    },
    {
      name: 'A2 Desi Cow Cultured Ghee',
      category: 'DAIRY',
      description: 'Hand-churned Vedic Bilona ghee prepared from fresh curd of grass-fed native indigenous cows.',
      price: 650.0,
      unit: '500ml',
      quantity: 35,
      availableQuantity: 30,
      location: 'Salem, Tamil Nadu',
      imageUrl: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=800&q=80',
      status: 'ACTIVE',
      transparency: {
        harvestDate: new Date('2026-09-15'),
        packingDate: new Date('2026-09-16'),
        expiryDate: new Date('2027-03-15'),
        origin: 'Dairy Sanctuary, Ravi Farms, Salem',
        batchNumber: 'GHE-2026-0915',
        ingredients: '100% Pure A2 Cow Milk Fat'
      }
    },
    {
      name: 'Fresh Podded Organic Groundnuts',
      category: 'NUTS',
      description: 'Freshly harvested soil-sweet groundnuts with intact shells. Plump kernels packed with natural plant protein.',
      price: 110.0,
      unit: 'kg',
      quantity: 80,
      availableQuantity: 75,
      location: 'Salem, Tamil Nadu',
      imageUrl: 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?auto=format&fit=crop&w=800&q=80',
      status: 'ACTIVE',
      transparency: {
        harvestDate: new Date('2026-09-16'),
        packingDate: new Date('2026-09-17'),
        expiryDate: new Date('2026-11-15'),
        origin: 'South Nitrogen Field, Ravi Farms, Salem',
        batchNumber: 'NUT-2026-0916',
        ingredients: '100% Organic Groundnuts in Shell'
      }
    },
    {
      name: 'Tender Green Coconuts',
      category: 'OTHER',
      description: 'Freshly harvested tender coconuts rich in natural electrolytes and pure coconut water.',
      price: 50.0,
      unit: 'piece',
      quantity: 150,
      availableQuantity: 120,
      location: 'Salem, Tamil Nadu',
      imageUrl: 'https://images.unsplash.com/photo-1544378730-8b5104b18790?auto=format&fit=crop&w=800&q=80',
      status: 'ACTIVE',
      transparency: {
        harvestDate: new Date('2026-09-18'),
        packingDate: new Date('2026-09-18'),
        expiryDate: new Date('2026-09-25'),
        origin: 'Coconut Grove 3, Ravi Farms, Salem',
        batchNumber: 'COC-2026-0918',
        ingredients: 'Raw natural coconut water & pulp'
      }
    },
    {
      name: 'Pure Salem Heirloom Turmeric',
      category: 'OTHER',
      description: 'Sun-dried Salem native Curcuma longa roots pulverized into rich aromatic golden turmeric.',
      price: 120.0,
      unit: '250g',
      quantity: 90,
      availableQuantity: 78,
      location: 'Salem, Tamil Nadu',
      imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
      status: 'ACTIVE',
      transparency: {
        harvestDate: new Date('2026-08-15'),
        packingDate: new Date('2026-09-01'),
        expiryDate: new Date('2027-08-15'),
        origin: 'Plot 2, Ravi Farms, Salem',
        batchNumber: 'TUR-2026-0815',
        ingredients: '100% Shade-Dried Salem Turmeric Root'
      }
    },
    {
      name: 'Fresh Morning Cut Spinach (Palak)',
      category: 'VEGETABLES',
      description: 'Crisp green native spinach harvested at dawn and bundled with natural coir string.',
      price: 25.0,
      unit: 'bunch',
      quantity: 100,
      availableQuantity: 85,
      location: 'Salem, Tamil Nadu',
      imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80',
      status: 'ACTIVE',
      transparency: {
        harvestDate: new Date('2026-09-18'),
        packingDate: new Date('2026-09-18'),
        expiryDate: new Date('2026-09-22'),
        origin: 'Green Shade Nursery, Ravi Farms, Salem',
        batchNumber: 'SPN-2026-0918',
        ingredients: '100% Fresh Green Spinach'
      }
    },
    {
      name: 'Small Country Shallots (Sambar Onions)',
      category: 'VEGETABLES',
      description: 'Intensely fragrant native shallots indispensable for South Indian curries and sambar.',
      price: 55.0,
      unit: 'kg',
      quantity: 130,
      availableQuantity: 110,
      location: 'Salem, Tamil Nadu',
      imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80',
      status: 'ACTIVE',
      transparency: {
        harvestDate: new Date('2026-09-16'),
        packingDate: new Date('2026-09-17'),
        expiryDate: new Date('2026-10-15'),
        origin: 'East Plots, Ravi Farms, Salem',
        batchNumber: 'ONN-2026-0916',
        ingredients: '100% Small Red Shallots'
      }
    }
  ];

  const createdProducts = [];
  for (const item of productsData) {
    const { transparency, ...productFields } = item;
    const createdProduct = await prisma.product.create({
      data: {
        ...productFields,
        farmerId: farmerProfileId,
        transparency: {
          create: transparency
        }
      }
    });
    createdProducts.push(createdProduct);
    console.log(`  🌾 Product: ${createdProduct.name} (₹${createdProduct.price}/${createdProduct.unit})`);
  }

  // 6. Seed Initial Real Order for Arun Kumar
  const tomato = createdProducts[0];
  const banana = createdProducts[1];

  const orderItemsData = [
    {
      productId: tomato.id,
      farmerId: farmerProfileId,
      quantity: 2,
      unitPrice: tomato.price,
      subtotal: tomato.price * 2
    },
    {
      productId: banana.id,
      farmerId: farmerProfileId,
      quantity: 1,
      unitPrice: banana.price,
      subtotal: banana.price * 1
    }
  ];

  const subtotal = orderItemsData.reduce((acc, it) => acc + it.subtotal, 0);
  const deliveryFee = 40;
  const totalAmount = subtotal + deliveryFee;

  const demoOrder = await prisma.order.create({
    data: {
      consumerId: consumerUser.consumerProfile.id,
      status: 'CONFIRMED',
      totalAmount,
      deliveryAddress: 'Arun Kumar (+91 98402 12345), Flat 402, Green Meadows, Fairlands, Salem, Tamil Nadu - 636016',
      paymentMethod: 'COD',
      items: {
        create: orderItemsData
      }
    }
  });

  console.log(`📦 Seeded Initial Confirmed Order: #FD${demoOrder.id.slice(-6).toUpperCase()} (Total: ₹${demoOrder.totalAmount})`);

  // 7. Seed Initial Favorites for Arun Kumar
  await prisma.favorite.createMany({
    data: [
      { consumerId: consumerUser.consumerProfile.id, productId: tomato.id },
      { consumerId: consumerUser.consumerProfile.id, productId: banana.id }
    ]
  });

  console.log(`❤️ Seeded 2 Initial Favorites for ${consumerUser.name}`);
  console.log('\n🎉 Database seed completed successfully!');
}

if (process.argv[1] === new URL(import.meta.url).pathname || process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(async () => {
      await prisma.$disconnect();
      process.exit(0);
    })
    .catch(async (e) => {
      console.error('❌ Error during seeding:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
