import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'password123';

async function main() {
  await prisma.notification.deleteMany();
  await prisma.match.deleteMany();
  await prisma.report.deleteMany();
  await prisma.review.deleteMany();
  await prisma.savedProperty.deleteMany();
  await prisma.image.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash(DEMO_PASSWORD, 10);

  const [admin, student, student2, landlord] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@demo.com',
        password,
        firstName: 'Ada',
        lastName: 'Admin',
        role: 'ADMIN',
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'student@demo.com',
        password,
        firstName: 'Alex',
        lastName: 'Student',
        role: 'STUDENT',
        university: 'MIT',
        studentId: 'S1001',
        isVerified: true,
        universityVerified: true,
        bio: 'I love coding, hiking and coffee. Looking for a quiet place near campus.',
      },
    }),
    prisma.user.create({
      data: {
        email: 'sam@demo.com',
        password,
        firstName: 'Sam',
        lastName: 'Rivera',
        role: 'STUDENT',
        university: 'MIT',
        studentId: 'S1002',
        isVerified: true,
        universityVerified: true,
        bio: 'Love coding, hiking and coffee too. Early riser, tidy and social.',
      },
    }),
    prisma.user.create({
      data: {
        email: 'landlord@demo.com',
        password,
        firstName: 'Lena',
        lastName: 'Landlord',
        role: 'LANDLORD',
        isVerified: true,
        bio: 'I manage several properties close to MIT.',
      },
    }),
  ]);

  const property = await prisma.property.create({
    data: {
      title: 'Sunny Studio near MIT',
      description:
        'Bright studio with a large desk, in-unit laundry and a short walk to campus.',
      address: '85 Amherst St',
      city: 'Cambridge',
      state: 'MA',
      zipCode: '02139',
      country: 'USA',
      latitude: 42.3601,
      longitude: -71.0942,
      price: 2400,
      deposit: 1200,
      monthlyRent: 80,
      propertyType: 'STUDIO',
      bedrooms: 1,
      bathrooms: 1,
      maxOccupancy: 2,
      amenities: 'WiFi,Laundry,Air Conditioning,Desk,Furnished',
      status: 'AVAILABLE',
      landlordId: landlord.id,
    },
  });

  await prisma.property.create({
    data: {
      title: 'Shared Apartment for Two',
      description: 'Two-bedroom apartment a 10 minute walk from the engineering quad.',
      address: '12 Ames St',
      city: 'Cambridge',
      state: 'MA',
      zipCode: '02142',
      country: 'USA',
      latitude: 42.3656,
      longitude: -71.1037,
      price: 3200,
      deposit: 1600,
      monthlyRent: 100,
      propertyType: 'APARTMENT',
      bedrooms: 2,
      bathrooms: 1,
      maxOccupancy: 2,
      amenities: 'WiFi,Dishwasher,Laundry,Bus Stop',
      status: 'AVAILABLE',
      landlordId: landlord.id,
    },
  });

  await prisma.image.create({
    data: {
      propertyId: property.id,
      url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',
      altText: 'Bright studio living room',
      isPrimary: true,
    },
  });

  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + 7);
  const checkOut = new Date();
  checkOut.setDate(checkOut.getDate() + 37);

  const booking = await prisma.booking.create({
    data: {
      userId: student.id,
      propertyId: property.id,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      status: 'PENDING',
      totalPrice: 2400,
    },
  });

  await prisma.payment.create({
    data: {
      userId: student.id,
      amount: 2400,
      status: 'PENDING',
      stripePaymentIntentId: 'pi_seed_placeholder',
      bookingId: booking.id,
    },
  });

  await prisma.savedProperty.create({
    data: { userId: student.id, propertyId: property.id },
  });

  await prisma.review.create({
    data: {
      userId: student2.id,
      propertyId: property.id,
      rating: 5,
      comment: 'Great light and very close to campus.',
    },
  });

  await prisma.match.create({
    data: {
      userAId: student.id,
      userBId: student2.id,
      score: 0.86,
      reasons: JSON.stringify([
        'You attend the same university',
        'Shared interests: coding, hiking, coffee',
      ]),
      status: 'PENDING',
    },
  });

  await prisma.report.create({
    data: {
      userId: student2.id,
      propertyId: property.id,
      reason: 'INACCURATE_PHOTOS',
      description: 'Photos do not match the current state of the unit.',
      status: 'PENDING',
    },
  });

  await prisma.notification.create({
    data: {
      userId: student.id,
      title: 'Booking requested',
      message: `Your request for ${property.title} is awaiting review.`,
      type: 'BOOKING_REQUEST',
    },
  });

  console.log('Seed complete.');
  console.log(`Demo accounts (password: ${DEMO_PASSWORD}):`);
  console.log(`  admin@demo.com    (ADMIN)`);
  console.log(`  student@demo.com  (STUDENT)`);
  console.log(`  sam@demo.com      (STUDENT)`);
  console.log(`  landlord@demo.com (LANDLORD)`);
  console.log(`Seeded admin id: ${admin.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
