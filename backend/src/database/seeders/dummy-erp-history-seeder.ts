import { PrismaClient, Role } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const START_DATE = new Date('2025-07-01T00:00:00.000Z');
const END_DATE = new Date('2026-06-30T23:59:59.000Z');

async function main() {
  console.log('🚀 Starting ERP History Generation...');
  
  const branches = await prisma.branch.findMany();
  const staff = await prisma.user.findMany({ 
    where: { 
      role: { in: [Role.BRANCH_MANAGER, Role.CASHIER, Role.HEAD_CHEF, Role.KITCHEN_STAFF, Role.DELIVERY_PARTNER] } 
    } 
  });
  
  if (staff.length === 0 || branches.length === 0) {
    console.error('No staff or branches found. Run the main dummy-history-seeder first.');
    return;
  }
  
  console.log(`Found ${staff.length} staff members and ${branches.length} branches. Generating HR & Ops History...`);

  const attendanceInserts = [];
  const workAssignmentInserts = [];
  const timelineInserts = [];

  let currentDate = new Date(START_DATE);
  
  while (currentDate <= END_DATE) {
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
    
    for (const employee of staff) {
      const branch = faker.helpers.arrayElement(branches);
      
      // Attendance
      const isAbsent = faker.number.int({ min: 1, max: 100 }) <= (isWeekend ? 10 : 3); // 10% absent on weekend, 3% on weekday
      if (!isAbsent) {
        const checkIn = new Date(currentDate);
        checkIn.setHours(faker.number.int({ min: 8, max: 10 }), faker.number.int({ min: 0, max: 59 }));
        
        const checkOut = new Date(currentDate);
        checkOut.setHours(faker.number.int({ min: 17, max: 20 }), faker.number.int({ min: 0, max: 59 }));
        
        const workingHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
        
        attendanceInserts.push({
          userId: employee.id,
          branchId: branch.id,
          date: currentDate,
          checkIn,
          checkOut,
          workingHours: parseFloat(workingHours.toFixed(2)),
          isLate: checkIn.getHours() >= 10,
          overtime: workingHours > 9 ? parseFloat((workingHours - 9).toFixed(2)) : 0,
          status: 'PRESENT',
        });
        
        // Work Assignment
        workAssignmentInserts.push({
          userId: employee.id,
          branchId: branch.id,
          shift: checkIn.getHours() < 9 ? 'MORNING' : 'EVENING',
          roleAssigned: employee.role === Role.KITCHEN_STAFF ? faker.helpers.arrayElement(['Pizza Station', 'Burger Station', 'Prep Line']) : employee.role,
          date: currentDate,
        });
      } else {
        attendanceInserts.push({
          userId: employee.id,
          branchId: branch.id,
          date: currentDate,
          status: 'ABSENT',
        });
      }
    }
    
    // Monthly events (Promotions, Warnings)
    if (currentDate.getDate() === 1) {
      for (const employee of staff) {
        if (faker.number.int({ min: 1, max: 100 }) <= 2) {
          timelineInserts.push({
            userId: employee.id,
            eventType: 'WARNING',
            description: 'Late arrival multiple times this month.',
            date: currentDate,
          });
        }
      }
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Insert Attendance
  console.log(`Inserting ${attendanceInserts.length} Attendance Logs...`);
  for (let i = 0; i < attendanceInserts.length; i += 5000) {
    await prisma.attendanceLog.createMany({ data: attendanceInserts.slice(i, i + 5000) });
    process.stdout.write('.');
  }
  
  console.log(`\nInserting ${workAssignmentInserts.length} Work Assignments...`);
  for (let i = 0; i < workAssignmentInserts.length; i += 5000) {
    await prisma.workAssignment.createMany({ data: workAssignmentInserts.slice(i, i + 5000) });
    process.stdout.write('.');
  }

  console.log(`\nInserting ${timelineInserts.length} Timeline Events...`);
  await prisma.employeeTimeline.createMany({ data: timelineInserts });

  console.log('\n🎉 ERP History Seeding Complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
