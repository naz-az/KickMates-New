import sqlite3 from 'sqlite3';
import { resolve } from 'path';
import bcrypt from 'bcrypt';
import { exec } from 'child_process';
import { promisify } from 'util';
import db, { runAsync, getAsync } from './index';

const dbPath = resolve(__dirname, '../../../data/kickmates.db');

const execAsync = promisify(exec);

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function seedDatabase() {
  console.log('Seeding database...');

  try {
    // Clean up existing data - disable foreign keys
    await runAsync('PRAGMA foreign_keys = OFF');
    
    await runAsync('DELETE FROM messages');
    await runAsync('DELETE FROM conversation_participants');
    await runAsync('DELETE FROM conversations');
    await runAsync('DELETE FROM notifications');
    await runAsync('DELETE FROM comment_votes');
    await runAsync('DELETE FROM discussion_votes');
    await runAsync('DELETE FROM comments');
    await runAsync('DELETE FROM bookmarks');
    await runAsync('DELETE FROM participants');
    await runAsync('DELETE FROM discussions');
    await runAsync('DELETE FROM events');
    await runAsync('DELETE FROM users');
    
    // Re-enable foreign keys
    await runAsync('PRAGMA foreign_keys = ON');
    
    console.log('✅ Cleared existing data');

    // Hash passwords
    const password1 = await hashPassword('password123');
    const password2 = await hashPassword('password456');
    const password3 = await hashPassword('password789');
    const password4 = await hashPassword('password321');
    const password5 = await hashPassword('password654');
    const password6 = await hashPassword('password987');
    const password7 = await hashPassword('password135');
    const password8 = await hashPassword('password246');
    const password9 = await hashPassword('password579');
    const password10 = await hashPassword('password024');
    const password11 = await hashPassword('password468');
    const password12 = await hashPassword('password802');
    const password13 = await hashPassword('password913');
    const password14 = await hashPassword('password357');
    const password15 = await hashPassword('password159');

    // Insert users
    const users = [
      {
        username: 'john_doe',
        email: 'john@example.com',
        password: password1,
        full_name: 'John Doe',
        bio: 'Sports enthusiast and football lover',
        profile_image: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61'
      },
      {
        username: 'jane_smith',
        email: 'jane@example.com',
        password: password2,
        full_name: 'Jane Smith',
        bio: 'Tennis player and runner',
        profile_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330'
      },
      {
        username: 'mike_johnson',
        email: 'mike@example.com',
        password: password3,
        full_name: 'Mike Johnson',
        bio: 'Basketball coach and player',
        profile_image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5'
      },
      {
        username: 'sarah_williams',
        email: 'sarah@example.com',
        password: password4,
        full_name: 'Sarah Williams',
        bio: 'Yoga instructor with 5 years of experience',
        profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'
      },
      {
        username: 'alex_rodriguez',
        email: 'alex@example.com',
        password: password5,
        full_name: 'Alex Rodriguez',
        bio: 'Former college soccer player, now weekend warrior',
        profile_image: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79'
      },
      {
        username: 'emily_chen',
        email: 'emily@example.com',
        password: password6,
        full_name: 'Emily Chen',
        bio: 'Swimming enthusiast and triathlete',
        profile_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2'
      },
      {
        username: 'david_wilson',
        email: 'david@example.com',
        password: password7,
        full_name: 'David Wilson',
        bio: 'Rugby player and fitness coach',
        profile_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e'
      },
      {
        username: 'lisa_brown',
        email: 'lisa@example.com',
        password: password8,
        full_name: 'Lisa Brown',
        bio: 'Volleyball player since high school',
        profile_image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956'
      },
      {
        username: 'kevin_martinez',
        email: 'kevin@example.com',
        password: password9,
        full_name: 'Kevin Martinez',
        bio: 'Cycling enthusiast and mountain biker',
        profile_image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d'
      },
      {
        username: 'natalie_parker',
        email: 'natalie@example.com',
        password: password10,
        full_name: 'Natalie Parker',
        bio: 'Rock climbing instructor and outdoor enthusiast',
        profile_image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91'
      },
      {
        username: 'carlos_garcia',
        email: 'carlos@example.com',
        password: password11,
        full_name: 'Carlos Garcia',
        bio: 'Baseball player and coach for youth teams',
        profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'
      },
      {
        username: 'michelle_taylor',
        email: 'michelle@example.com',
        password: password12,
        full_name: 'Michelle Taylor',
        bio: 'Marathon runner and fitness blogger',
        profile_image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9'
      },
      {
        username: 'ryan_adams',
        email: 'ryan@example.com',
        password: password13,
        full_name: 'Ryan Adams',
        bio: 'Snowboarder and winter sports lover',
        profile_image: 'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1'
      },
      {
        username: 'olivia_wilson',
        email: 'olivia@example.com',
        password: password14,
        full_name: 'Olivia Wilson',
        bio: 'Badminton champion and table tennis player',
        profile_image: 'https://images.unsplash.com/photo-1593104547489-5cfb3839a3b5'
      },
      {
        username: 'jason_nguyen',
        email: 'jason@example.com',
        password: password15,
        full_name: 'Jason Nguyen',
        bio: 'Golf player with 10+ years experience',
        profile_image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857'
      }
    ];

    // Insert users
    for (const user of users) {
      await runAsync(
        `INSERT INTO users (username, email, password, full_name, bio, profile_image) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user.username, user.email, user.password, user.full_name, user.bio, user.profile_image]
      );
    }
    console.log('✅ Sample users created');

    // Insert events
    const events = [
      {
        creator_id: 1,
        title: 'Weekend Football Match',
        description: 'Friendly football match at the local park. All skill levels welcome!',
        sport_type: 'Football',
        location: 'Central Park, New York',
        start_date: '2025-05-15 14:00:00',
        end_date: '2025-05-15 16:00:00',
        max_players: 14,
        current_players: 5,
        image_url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55'
      },
      {
        creator_id: 2,
        title: 'Tennis Tournament',
        description: 'Singles tennis tournament, intermediate to advanced players.',
        sport_type: 'Tennis',
        location: 'Richmond Tennis Club',
        start_date: '2025-06-10 10:00:00',
        end_date: '2025-06-10 18:00:00',
        max_players: 8,
        current_players: 4,
        image_url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      },
      {
        creator_id: 3,
        title: 'Basketball Pickup Game',
        description: 'Thursday night basketball pickup game. First come, first play!',
        sport_type: 'Basketball',
        location: 'Downtown Community Center',
        start_date: '2025-05-20 19:00:00',
        end_date: '2025-05-20 21:00:00',
        max_players: 10,
        current_players: 6,
        image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2090&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      },
      {
        creator_id: 1,
        title: 'Morning Yoga Session',
        description: 'Start your day with a revitalizing yoga session. Suitable for beginners.',
        sport_type: 'Yoga',
        location: 'Sunrise Yoga Studio',
        start_date: '2025-05-18 07:00:00',
        end_date: '2025-05-18 08:30:00',
        max_players: 15,
        current_players: 8,
        image_url: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b'
      },
      {
        creator_id: 4,
        title: 'Advanced Yoga Workshop',
        description: 'Intensive yoga workshop focusing on advanced poses and breathing techniques.',
        sport_type: 'Yoga',
        location: 'Harmony Yoga Center',
        start_date: '2025-05-25 09:00:00',
        end_date: '2025-05-25 11:30:00',
        max_players: 12,
        current_players: 6,
        image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773'
      },
      {
        creator_id: 5,
        title: 'Sunday Soccer League',
        description: 'Competitive soccer league matches every Sunday. Team registration required.',
        sport_type: 'Football',
        location: 'Riverside Fields',
        start_date: '2025-06-01 13:00:00',
        end_date: '2025-06-01 16:00:00',
        max_players: 22,
        current_players: 15,
        image_url: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c'
      },
      {
        creator_id: 6,
        title: 'Triathlon Training Group',
        description: 'Weekly training sessions for triathletes of all levels. Bring your own equipment.',
        sport_type: 'Triathlon',
        location: 'City Sports Complex',
        start_date: '2025-05-22 06:30:00',
        end_date: '2025-05-22 08:30:00',
        max_players: 20,
        current_players: 10,
        image_url: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba'
      },
      {
        creator_id: 7,
        title: 'Rugby Practice Match',
        description: 'Practice match for rugby enthusiasts. Protective gear recommended.',
        sport_type: 'Rugby',
        location: 'University Sports Field',
        start_date: '2025-05-23 15:00:00',
        end_date: '2025-05-23 17:00:00',
        max_players: 30,
        current_players: 20,
        image_url: 'https://images.unsplash.com/photo-1485426337939-af69cf101909?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      },
      {
        creator_id: 8,
        title: 'Volleyball Beach Tournament',
        description: 'Beach volleyball tournament with prizes for winners. Teams of 2-3 players.',
        sport_type: 'Volleyball',
        location: 'Seaside Beach',
        start_date: '2025-06-15 11:00:00',
        end_date: '2025-06-15 18:00:00',
        max_players: 24,
        current_players: 12,
        image_url: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1'
      },
      {
        creator_id: 9,
        title: 'Cycling Group Ride',
        description: 'Scenic 30-mile group cycling ride. Moderate pace, helmet required.',
        sport_type: 'Cycling',
        location: 'Mountain View Trail',
        start_date: '2025-05-30 07:30:00',
        end_date: '2025-05-30 11:30:00',
        max_players: 15,
        current_players: 7,
        image_url: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182'
      },
      {
        creator_id: 10,
        title: 'Rock Climbing Workshop',
        description: 'Indoor rock climbing workshop for beginners. Equipment provided.',
        sport_type: 'Rock Climbing',
        location: 'Vertical Wall Climbing Center',
        start_date: '2025-06-05 16:00:00',
        end_date: '2025-06-05 18:00:00',
        max_players: 8,
        current_players: 5,
        image_url: 'https://images.unsplash.com/photo-1522163182402-834f871fd851'
      },
      {
        creator_id: 11,
        title: 'Baseball Pickup Game',
        description: 'Casual baseball game at the park. Bring your own glove.',
        sport_type: 'Baseball',
        location: 'Community Baseball Field',
        start_date: '2025-06-08 10:00:00',
        end_date: '2025-06-08 12:30:00',
        max_players: 18,
        current_players: 9,
        image_url: 'https://images.unsplash.com/photo-1516731415730-0c607149933a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      },
      {
        creator_id: 12,
        title: 'Marathon Training Run',
        description: '15-mile group training run for upcoming marathon. Water stations provided.',
        sport_type: 'Running',
        location: 'City River Path',
        start_date: '2025-05-27 07:00:00',
        end_date: '2025-05-27 10:00:00',
        max_players: 25,
        current_players: 12,
        image_url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5'
      },
      {
        creator_id: 13,
        title: 'Snowboarding Weekend',
        description: 'Weekend snowboarding trip to the mountains. All skill levels welcome.',
        sport_type: 'Snowboarding',
        location: 'Alpine Mountain Resort',
        start_date: '2025-07-20 08:00:00',
        end_date: '2025-07-21 16:00:00',
        max_players: 10,
        current_players: 5,
        image_url: 'https://plus.unsplash.com/premium_photo-1661942800988-c0393d351f7d?q=80&w=2060&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      },
      {
        creator_id: 14,
        title: 'Badminton Doubles Tournament',
        description: 'Doubles badminton tournament with mixed pairs. Intermediate level.',
        sport_type: 'Badminton',
        location: 'Indoor Sports Arena',
        start_date: '2025-06-12 18:00:00',
        end_date: '2025-06-12 22:00:00',
        max_players: 16,
        current_players: 8,
        image_url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea'
      },
      {
        creator_id: 15,
        title: 'Golf Day Out',
        description: '18-hole golf day with lunch included. Bring your own clubs.',
        sport_type: 'Golf',
        location: 'Greenview Golf Course',
        start_date: '2025-06-18 09:00:00',
        end_date: '2025-06-18 15:00:00',
        max_players: 12,
        current_players: 4,
        image_url: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa'
      },
      {
        creator_id: 3,
        title: 'Pro Basketball Training Session',
        description: 'Advanced basketball training with former pro player. Focus on shooting and defense.',
        sport_type: 'Basketball',
        location: 'Elite Sports Academy',
        start_date: '2025-05-29 19:30:00',
        end_date: '2025-05-29 21:30:00',
        max_players: 12,
        current_players: 7,
        image_url: 'https://images.unsplash.com/photo-1519861531473-9200262188bf'
      },
      {
        creator_id: 5,
        title: 'Indoor 5-a-side Football',
        description: 'Weekly indoor football tournament. Fast-paced and fun!',
        sport_type: 'Football',
        location: 'Indoor Football Arena',
        start_date: '2025-06-03 20:00:00',
        end_date: '2025-06-03 22:00:00',
        max_players: 20,
        current_players: 10,
        image_url: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68'
      },
      {
        creator_id: 2,
        title: 'Tennis Coaching Clinic',
        description: 'Tennis coaching clinic focusing on serve and volley techniques.',
        sport_type: 'Tennis',
        location: 'Grand Slam Tennis Center',
        start_date: '2025-06-25 16:00:00',
        end_date: '2025-06-25 18:00:00',
        max_players: 10,
        current_players: 6,
        image_url: 'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534'
      },
      {
        creator_id: 7,
        title: 'Touch Rugby for Beginners',
        description: 'Introduction to touch rugby for beginners. No previous experience required.',
        sport_type: 'Rugby',
        location: 'Community Park Fields',
        start_date: '2025-06-11 17:30:00',
        end_date: '2025-06-11 19:00:00',
        max_players: 20,
        current_players: 8,
        image_url: 'https://images.unsplash.com/photo-1558151507-c1aa3d917dbb?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      }
    ];

    // Insert events
    for (const event of events) {
      await runAsync(
        `INSERT INTO events (creator_id, title, description, sport_type, location, start_date, end_date, max_players, current_players, image_url) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          event.creator_id,
          event.title,
          event.description,
          event.sport_type,
          event.location,
          event.start_date,
          event.end_date,
          event.max_players,
          event.current_players,
          event.image_url
        ]
      );
    }
    console.log('✅ Sample events created');

    // Insert participants
    const participants = [
      { event_id: 1, user_id: 1, status: 'confirmed' },
      { event_id: 1, user_id: 2, status: 'confirmed' },
      { event_id: 1, user_id: 3, status: 'confirmed' },
      { event_id: 1, user_id: 5, status: 'confirmed' },
      { event_id: 1, user_id: 7, status: 'waiting' },
      { event_id: 1, user_id: 9, status: 'waiting' },
      { event_id: 1, user_id: 12, status: 'waiting' },
      
      { event_id: 2, user_id: 2, status: 'confirmed' },
      { event_id: 2, user_id: 3, status: 'confirmed' },
      { event_id: 2, user_id: 14, status: 'confirmed' },
      { event_id: 2, user_id: 6, status: 'confirmed' },
      { event_id: 2, user_id: 8, status: 'waiting' },
      { event_id: 2, user_id: 10, status: 'waiting' },
      
      { event_id: 3, user_id: 3, status: 'confirmed' },
      { event_id: 3, user_id: 1, status: 'confirmed' },
      { event_id: 3, user_id: 4, status: 'confirmed' },
      { event_id: 3, user_id: 8, status: 'confirmed' },
      { event_id: 3, user_id: 11, status: 'confirmed' },
      { event_id: 3, user_id: 15, status: 'confirmed' },
      { event_id: 3, user_id: 13, status: 'waiting' },
      { event_id: 3, user_id: 9, status: 'waiting' },
      
      { event_id: 4, user_id: 1, status: 'confirmed' },
      { event_id: 4, user_id: 2, status: 'waiting' },
      { event_id: 4, user_id: 4, status: 'confirmed' },
      { event_id: 4, user_id: 6, status: 'confirmed' },
      { event_id: 4, user_id: 8, status: 'confirmed' },
      { event_id: 4, user_id: 10, status: 'confirmed' },
      { event_id: 4, user_id: 12, status: 'confirmed' },
      { event_id: 4, user_id: 14, status: 'confirmed' },
      { event_id: 4, user_id: 7, status: 'waiting' },
      
      { event_id: 5, user_id: 4, status: 'confirmed' },
      { event_id: 5, user_id: 6, status: 'confirmed' },
      { event_id: 5, user_id: 8, status: 'confirmed' },
      { event_id: 5, user_id: 10, status: 'confirmed' },
      { event_id: 5, user_id: 12, status: 'confirmed' },
      { event_id: 5, user_id: 14, status: 'confirmed' },
      { event_id: 5, user_id: 2, status: 'waiting' },
      
      { event_id: 6, user_id: 5, status: 'confirmed' },
      { event_id: 6, user_id: 1, status: 'confirmed' },
      { event_id: 6, user_id: 3, status: 'confirmed' },
      { event_id: 6, user_id: 7, status: 'confirmed' },
      { event_id: 6, user_id: 9, status: 'confirmed' },
      { event_id: 6, user_id: 11, status: 'confirmed' },
      { event_id: 6, user_id: 13, status: 'confirmed' },
      { event_id: 6, user_id: 15, status: 'confirmed' },
      { event_id: 6, user_id: 2, status: 'waiting' },
      { event_id: 6, user_id: 4, status: 'waiting' },
      { event_id: 6, user_id: 6, status: 'waiting' },
      { event_id: 6, user_id: 8, status: 'waiting' },
      { event_id: 6, user_id: 10, status: 'waiting' },
      { event_id: 6, user_id: 12, status: 'waiting' },
      { event_id: 6, user_id: 14, status: 'waiting' },
      
      { event_id: 7, user_id: 6, status: 'confirmed' },
      { event_id: 7, user_id: 2, status: 'confirmed' },
      { event_id: 7, user_id: 4, status: 'confirmed' },
      { event_id: 7, user_id: 8, status: 'confirmed' },
      { event_id: 7, user_id: 10, status: 'confirmed' },
      { event_id: 7, user_id: 12, status: 'confirmed' },
      { event_id: 7, user_id: 14, status: 'confirmed' },
      { event_id: 7, user_id: 3, status: 'confirmed' },
      { event_id: 7, user_id: 5, status: 'confirmed' },
      { event_id: 7, user_id: 9, status: 'waiting' },
      
      { event_id: 8, user_id: 7, status: 'confirmed' },
      { event_id: 8, user_id: 1, status: 'confirmed' },
      { event_id: 8, user_id: 3, status: 'confirmed' },
      { event_id: 8, user_id: 5, status: 'confirmed' },
      { event_id: 8, user_id: 9, status: 'confirmed' },
      { event_id: 8, user_id: 11, status: 'confirmed' },
      { event_id: 8, user_id: 13, status: 'confirmed' },
      { event_id: 8, user_id: 15, status: 'confirmed' },
      { event_id: 8, user_id: 2, status: 'confirmed' },
      { event_id: 8, user_id: 4, status: 'confirmed' },
      { event_id: 8, user_id: 6, status: 'confirmed' },
      { event_id: 8, user_id: 8, status: 'waiting' },
      { event_id: 8, user_id: 10, status: 'waiting' },
      { event_id: 8, user_id: 12, status: 'waiting' },
      { event_id: 8, user_id: 14, status: 'waiting' },
      
      { event_id: 9, user_id: 8, status: 'confirmed' },
      { event_id: 9, user_id: 2, status: 'confirmed' },
      { event_id: 9, user_id: 4, status: 'confirmed' },
      { event_id: 9, user_id: 6, status: 'confirmed' },
      { event_id: 9, user_id: 10, status: 'confirmed' },
      { event_id: 9, user_id: 12, status: 'confirmed' },
      
      { event_id: 10, user_id: 9, status: 'confirmed' },
      { event_id: 10, user_id: 1, status: 'confirmed' },
      { event_id: 10, user_id: 3, status: 'confirmed' },
      { event_id: 10, user_id: 5, status: 'confirmed' },
      { event_id: 10, user_id: 7, status: 'confirmed' },
      { event_id: 10, user_id: 11, status: 'confirmed' },
      { event_id: 10, user_id: 13, status: 'waiting' },
      
      { event_id: 11, user_id: 10, status: 'confirmed' },
      { event_id: 11, user_id: 2, status: 'confirmed' },
      { event_id: 11, user_id: 4, status: 'confirmed' },
      { event_id: 11, user_id: 6, status: 'confirmed' },
      { event_id: 11, user_id: 8, status: 'confirmed' },
      
      { event_id: 12, user_id: 11, status: 'confirmed' },
      { event_id: 12, user_id: 1, status: 'confirmed' },
      { event_id: 12, user_id: 3, status: 'confirmed' },
      { event_id: 12, user_id: 5, status: 'confirmed' },
      { event_id: 12, user_id: 7, status: 'confirmed' },
      { event_id: 12, user_id: 9, status: 'confirmed' },
      { event_id: 12, user_id: 13, status: 'confirmed' },
      { event_id: 12, user_id: 15, status: 'confirmed' },
      { event_id: 12, user_id: 2, status: 'waiting' },
      
      { event_id: 13, user_id: 12, status: 'confirmed' },
      { event_id: 13, user_id: 2, status: 'confirmed' },
      { event_id: 13, user_id: 4, status: 'confirmed' },
      { event_id: 13, user_id: 6, status: 'confirmed' },
      { event_id: 13, user_id: 8, status: 'confirmed' },
      
      { event_id: 14, user_id: 13, status: 'confirmed' },
      { event_id: 14, user_id: 1, status: 'confirmed' },
      { event_id: 14, user_id: 3, status: 'confirmed' },
      { event_id: 14, user_id: 5, status: 'confirmed' },
      { event_id: 14, user_id: 7, status: 'confirmed' },
      { event_id: 14, user_id: 9, status: 'confirmed' },
      { event_id: 14, user_id: 11, status: 'confirmed' },
      { event_id: 14, user_id: 15, status: 'waiting' },
      
      { event_id: 15, user_id: 14, status: 'confirmed' },
      { event_id: 15, user_id: 2, status: 'confirmed' },
      { event_id: 15, user_id: 4, status: 'confirmed' },
      { event_id: 15, user_id: 6, status: 'waiting' },
      
      { event_id: 16, user_id: 15, status: 'confirmed' },
      { event_id: 16, user_id: 1, status: 'confirmed' },
      { event_id: 16, user_id: 3, status: 'confirmed' },
      { event_id: 16, user_id: 5, status: 'confirmed' },
      { event_id: 16, user_id: 7, status: 'confirmed' },
      { event_id: 16, user_id: 9, status: 'confirmed' },
      { event_id: 16, user_id: 11, status: 'confirmed' },
      { event_id: 16, user_id: 13, status: 'waiting' },
      
      { event_id: 17, user_id: 3, status: 'confirmed' },
      { event_id: 17, user_id: 2, status: 'confirmed' },
      { event_id: 17, user_id: 4, status: 'confirmed' },
      { event_id: 17, user_id: 6, status: 'confirmed' },
      { event_id: 17, user_id: 8, status: 'confirmed' },
      { event_id: 17, user_id: 10, status: 'confirmed' },
      { event_id: 17, user_id: 12, status: 'confirmed' },
      { event_id: 17, user_id: 14, status: 'waiting' },
      { event_id: 17, user_id: 1, status: 'waiting' },
      
      { event_id: 18, user_id: 5, status: 'confirmed' },
      { event_id: 18, user_id: 1, status: 'confirmed' },
      { event_id: 18, user_id: 3, status: 'confirmed' },
      { event_id: 18, user_id: 7, status: 'confirmed' },
      { event_id: 18, user_id: 9, status: 'confirmed' },
      { event_id: 18, user_id: 11, status: 'confirmed' },
      { event_id: 18, user_id: 13, status: 'confirmed' },
      { event_id: 18, user_id: 15, status: 'confirmed' },
      { event_id: 18, user_id: 2, status: 'waiting' },
      { event_id: 18, user_id: 4, status: 'waiting' },
      
      { event_id: 19, user_id: 2, status: 'confirmed' },
      { event_id: 19, user_id: 4, status: 'confirmed' },
      { event_id: 19, user_id: 6, status: 'confirmed' },
      { event_id: 19, user_id: 8, status: 'confirmed' },
      { event_id: 19, user_id: 10, status: 'confirmed' },
      { event_id: 19, user_id: 12, status: 'waiting' },
      
      { event_id: 20, user_id: 7, status: 'confirmed' },
      { event_id: 20, user_id: 1, status: 'confirmed' },
      { event_id: 20, user_id: 3, status: 'confirmed' },
      { event_id: 20, user_id: 5, status: 'confirmed' },
      { event_id: 20, user_id: 9, status: 'confirmed' },
      { event_id: 20, user_id: 11, status: 'confirmed' },
      { event_id: 20, user_id: 13, status: 'confirmed' },
      { event_id: 20, user_id: 15, status: 'waiting' }
    ];

    // Insert participants
    for (const participant of participants) {
      await runAsync(
        `INSERT INTO participants (event_id, user_id, status) 
         VALUES (?, ?, ?)`,
        [participant.event_id, participant.user_id, participant.status]
      );
    }
    console.log('✅ Sample participants created');

    // Insert comments
    const comments = [
      { event_id: 1, user_id: 2, content: "Looking forward to this match!", thumbs_up: 3, thumbs_down: 0 },
      { event_id: 1, user_id: 3, content: "Should we bring our own balls?", thumbs_up: 1, thumbs_down: 0 },
      { event_id: 1, user_id: 1, content: "Yes, please bring a ball if you have one.", parent_comment_id: 2, thumbs_up: 2, thumbs_down: 0 },
      { event_id: 1, user_id: 5, content: "What time should we arrive for warm-up?", thumbs_up: 0, thumbs_down: 0 },
      { event_id: 1, user_id: 1, content: "I recommend arriving 30 minutes early for warm-up.", parent_comment_id: 4, thumbs_up: 1, thumbs_down: 0 },
      { event_id: 1, user_id: 2, content: "Is there parking available nearby?", thumbs_up: 0, thumbs_down: 0 },
      { event_id: 1, user_id: 1, content: "Yes, there is a parking lot just across the street.", parent_comment_id: 6, thumbs_up: 2, thumbs_down: 0 },
      
      { event_id: 2, user_id: 3, content: "What's the prize for the winner?", thumbs_up: 4, thumbs_down: 0 },
      { event_id: 2, user_id: 2, content: "The winner gets a trophy and a $50 gift card to the pro shop.", parent_comment_id: 8, thumbs_up: 2, thumbs_down: 0 },
      { event_id: 2, user_id: 14, content: "Are there any restrictions on racket types?", thumbs_up: 1, thumbs_down: 0 },
      { event_id: 2, user_id: 2, content: "No restrictions on rackets, just standard tennis rules.", parent_comment_id: 10, thumbs_up: 0, thumbs_down: 0 },
      { event_id: 2, user_id: 6, content: "Will there be refreshments provided?", thumbs_up: 2, thumbs_down: 0 },
      { event_id: 2, user_id: 2, content: "Yes, water and snacks will be available throughout the tournament.", parent_comment_id: 12, thumbs_up: 3, thumbs_down: 0 },
      
      { event_id: 3, user_id: 1, content: "Is there parking available nearby?", thumbs_up: 0, thumbs_down: 0 },
      { event_id: 3, user_id: 3, content: "Yes, there's a parking lot right next to the center.", parent_comment_id: 14, thumbs_up: 1, thumbs_down: 0 },
      { event_id: 3, user_id: 4, content: "Are we playing full or half court?", thumbs_up: 2, thumbs_down: 0 },
      { event_id: 3, user_id: 3, content: "Full court, 5-on-5 games.", parent_comment_id: 16, thumbs_up: 3, thumbs_down: 0 },
      { event_id: 3, user_id: 8, content: "Is there a water fountain at the court?", thumbs_up: 0, thumbs_down: 0 },
      { event_id: 3, user_id: 3, content: "Yes, but bring your own water bottle to be safe.", parent_comment_id: 18, thumbs_up: 5, thumbs_down: 0 },
      { event_id: 3, user_id: 11, content: "Can I bring a friend who's not registered?", thumbs_up: 0, thumbs_down: 1 },
      { event_id: 3, user_id: 3, content: "Sure, just have them sign up on the app first so we can track numbers.", parent_comment_id: 20, thumbs_up: 2, thumbs_down: 0 },
      
      { event_id: 4, user_id: 2, content: "Should we bring our own yoga mats?", thumbs_up: 3, thumbs_down: 0 },
      { event_id: 4, user_id: 1, content: "Mats are provided, but feel free to bring your own if preferred.", parent_comment_id: 22, thumbs_up: 4, thumbs_down: 0 },
      { event_id: 4, user_id: 4, content: "Is this suitable for someone who has never done yoga before?", thumbs_up: 1, thumbs_down: 0 },
      { event_id: 4, user_id: 1, content: "Absolutely! This session is designed for all levels, including complete beginners.", parent_comment_id: 24, thumbs_up: 2, thumbs_down: 0 },
      { event_id: 4, user_id: 6, content: "What style of yoga will we be practicing?", thumbs_up: 0, thumbs_down: 0 },
      { event_id: 4, user_id: 1, content: "This will be a gentle Hatha yoga session with some basic Vinyasa flows.", parent_comment_id: 26, thumbs_up: 1, thumbs_down: 0 },
      { event_id: 4, user_id: 8, content: "Should we eat breakfast before the session?", thumbs_up: 0, thumbs_down: 0 },
      { event_id: 4, user_id: 1, content: "A light snack is recommended, but avoid heavy meals at least 2 hours before.", parent_comment_id: 28, thumbs_up: 3, thumbs_down: 0 },
      
      { event_id: 5, user_id: 6, content: "I've been practicing yoga for a year. Is this session going to be challenging enough?", thumbs_up: 1, thumbs_down: 0 },
      { event_id: 5, user_id: 4, content: "Definitely! We'll be working on advanced inversions and arm balances.", parent_comment_id: 30, thumbs_up: 2, thumbs_down: 0 },
      { event_id: 5, user_id: 8, content: "Should I bring any props like blocks or straps?", thumbs_up: 0, thumbs_down: 0 },
      { event_id: 5, user_id: 4, content: "All props will be provided, but you're welcome to bring your own if you prefer.", parent_comment_id: 32, thumbs_up: 1, thumbs_down: 0 },
      { event_id: 5, user_id: 10, content: "How hot will the room be?", thumbs_up: 0, thumbs_down: 0 },
      { event_id: 5, user_id: 4, content: "The room will be at a comfortable temperature, not heated like hot yoga.", parent_comment_id: 34, thumbs_up: 2, thumbs_down: 0 },
      
      { event_id: 6, user_id: 1, content: "How many players per team?", thumbs_up: 3, thumbs_down: 0 },
      { event_id: 6, user_id: 5, content: "We'll be playing 11-a-side with standard rules.", parent_comment_id: 36, thumbs_up: 2, thumbs_down: 0 },
      { event_id: 6, user_id: 3, content: "Are cleats required?", thumbs_up: 1, thumbs_down: 0 },
      { event_id: 6, user_id: 5, content: "Highly recommended, especially if it has rained recently.", parent_comment_id: 38, thumbs_up: 4, thumbs_down: 0 },
      { event_id: 6, user_id: 7, content: "How long are the matches?", thumbs_up: 0, thumbs_down: 0 },
      { event_id: 6, user_id: 5, content: "Each match is 90 minutes with a halftime break.", parent_comment_id: 40, thumbs_up: 2, thumbs_down: 0 },
      
      { event_id: 7, user_id: 2, content: "Will there be coaches available to give tips?", thumbs_up: 2, thumbs_down: 0 },
      { event_id: 7, user_id: 6, content: "Yes, I'll be there along with two other experienced triathletes to provide guidance.", parent_comment_id: 42, thumbs_up: 3, thumbs_down: 0 },
      { event_id: 7, user_id: 4, content: "What equipment should I bring?", thumbs_up: 1, thumbs_down: 0 },
      { event_id: 7, user_id: 6, content: "Bring your running shoes, swimwear, and bike if you have one. We have a few spare bikes if needed.", parent_comment_id: 44, thumbs_up: 4, thumbs_down: 0 },
      { event_id: 7, user_id: 8, content: "What distance will we be training for?", thumbs_up: 2, thumbs_down: 0 },
      { event_id: 7, user_id: 6, content: "We'll focus on sprint distance (750m swim, 20km bike, 5km run), but can adjust based on participant goals.", parent_comment_id: 46, thumbs_up: 5, thumbs_down: 0 },
      
      { event_id: 8, user_id: 1, content: "Is this touch or full contact rugby?", thumbs_up: 3, thumbs_down: 0 },
      { event_id: 8, user_id: 7, content: "This is full contact, so mouth guards and proper boots are essential.", parent_comment_id: 48, thumbs_up: 4, thumbs_down: 0 },
      { event_id: 8, user_id: 3, content: "Will you be splitting teams based on experience?", thumbs_up: 1, thumbs_down: 0 },
      { event_id: 8, user_id: 7, content: "Yes, we'll try to balance the teams based on experience level.", parent_comment_id: 50, thumbs_up: 2, thumbs_down: 0 },
      { event_id: 8, user_id: 5, content: "Is there a first aid team on site?", thumbs_up: 4, thumbs_down: 0 },
      { event_id: 8, user_id: 7, content: "Yes, we'll have a sports therapist present throughout the match.", parent_comment_id: 52, thumbs_up: 5, thumbs_down: 0 },
      
      { event_id: 9, user_id: 2, content: "What's the format of the tournament?", thumbs_up: 2, thumbs_down: 0 },
      { event_id: 9, user_id: 8, content: "Round robin followed by elimination rounds for the top teams.", parent_comment_id: 54, thumbs_up: 3, thumbs_down: 0 },
      { event_id: 9, user_id: 4, content: "Will the nets be regulation height?", thumbs_up: 0, thumbs_down: 0 },
      { event_id: 9, user_id: 8, content: "Yes, standard beach volleyball net height (2.43m for men, 2.24m for women).", parent_comment_id: 56, thumbs_up: 1, thumbs_down: 0 },
      { event_id: 9, user_id: 6, content: "Is there shade available for between matches?", thumbs_up: 2, thumbs_down: 0 },
      { event_id: 9, user_id: 8, content: "Yes, we'll have tents and umbrellas set up around the courts.", parent_comment_id: 58, thumbs_up: 3, thumbs_down: 0 },
      
      { event_id: 10, user_id: 1, content: "What's the terrain like on this route?", thumbs_up: 1, thumbs_down: 0 },
      { event_id: 10, user_id: 9, content: "Mostly paved roads with some gentle hills, suitable for road bikes.", parent_comment_id: 60, thumbs_up: 2, thumbs_down: 0 },
      { event_id: 10, user_id: 3, content: "How fast will the group be riding?", thumbs_up: 0, thumbs_down: 0 },
      { event_id: 10, user_id: 9, content: "We'll be riding at a moderate pace, around 15-18mph average.", parent_comment_id: 62, thumbs_up: 3, thumbs_down: 0 },
      { event_id: 10, user_id: 5, content: "Are there any rest stops along the route?", thumbs_up: 1, thumbs_down: 0 },
      { event_id: 10, user_id: 9, content: "Yes, we'll stop at a cafe about halfway through the ride.", parent_comment_id: 64, thumbs_up: 4, thumbs_down: 0 }
    ];

    // Insert comments
    for (const comment of comments) {
      await runAsync(
        `INSERT INTO comments (event_id, user_id, content, parent_comment_id, thumbs_up, thumbs_down) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [comment.event_id, comment.user_id, comment.content, comment.parent_comment_id || null, comment.thumbs_up || 0, comment.thumbs_down || 0]
      );
    }
    console.log('✅ Sample comments created');

    // Insert comment votes
    const commentVotes = [
      { comment_id: 1, user_id: 3, vote_type: 'up' },
      { comment_id: 1, user_id: 4, vote_type: 'up' },
      { comment_id: 1, user_id: 5, vote_type: 'up' },
      { comment_id: 2, user_id: 1, vote_type: 'up' },
      { comment_id: 3, user_id: 4, vote_type: 'up' },
      { comment_id: 3, user_id: 5, vote_type: 'up' },
      { comment_id: 5, user_id: 3, vote_type: 'up' },
      { comment_id: 7, user_id: 3, vote_type: 'up' },
      { comment_id: 7, user_id: 4, vote_type: 'up' },
      { comment_id: 8, user_id: 1, vote_type: 'up' },
      { comment_id: 8, user_id: 5, vote_type: 'up' },
      { comment_id: 8, user_id: 7, vote_type: 'up' },
      { comment_id: 8, user_id: 9, vote_type: 'up' },
      { comment_id: 9, user_id: 1, vote_type: 'up' },
      { comment_id: 9, user_id: 3, vote_type: 'up' },
      { comment_id: 10, user_id: 2, vote_type: 'up' },
      { comment_id: 12, user_id: 1, vote_type: 'up' },
      { comment_id: 12, user_id: 4, vote_type: 'up' },
      { comment_id: 13, user_id: 1, vote_type: 'up' },
      { comment_id: 13, user_id: 4, vote_type: 'up' },
      { comment_id: 13, user_id: 8, vote_type: 'up' },
      { comment_id: 16, user_id: 1, vote_type: 'up' },
      { comment_id: 16, user_id: 5, vote_type: 'up' },
      { comment_id: 17, user_id: 1, vote_type: 'up' },
      { comment_id: 17, user_id: 5, vote_type: 'up' },
      { comment_id: 17, user_id: 7, vote_type: 'up' },
      { comment_id: 19, user_id: 1, vote_type: 'up' },
      { comment_id: 19, user_id: 4, vote_type: 'up' },
      { comment_id: 19, user_id: 7, vote_type: 'up' },
      { comment_id: 19, user_id: 8, vote_type: 'up' },
      { comment_id: 19, user_id: 10, vote_type: 'up' },
      { comment_id: 20, user_id: 5, vote_type: 'down' },
      { comment_id: 21, user_id: 1, vote_type: 'up' },
      { comment_id: 21, user_id: 5, vote_type: 'up' },
      { comment_id: 22, user_id: 1, vote_type: 'up' },
      { comment_id: 22, user_id: 3, vote_type: 'up' },
      { comment_id: 22, user_id: 7, vote_type: 'up' },
      { comment_id: 23, user_id: 2, vote_type: 'up' },
      { comment_id: 23, user_id: 3, vote_type: 'up' },
      { comment_id: 23, user_id: 5, vote_type: 'up' },
      { comment_id: 23, user_id: 7, vote_type: 'up' },
      { comment_id: 24, user_id: 5, vote_type: 'up' },
      { comment_id: 25, user_id: 2, vote_type: 'up' },
      { comment_id: 25, user_id: 3, vote_type: 'up' },
      { comment_id: 28, user_id: 2, vote_type: 'up' },
      { comment_id: 29, user_id: 2, vote_type: 'up' },
      { comment_id: 29, user_id: 7, vote_type: 'up' },
      { comment_id: 29, user_id: 9, vote_type: 'up' },
      { comment_id: 30, user_id: 4, vote_type: 'up' },
      { comment_id: 31, user_id: 6, vote_type: 'up' },
      { comment_id: 31, user_id: 9, vote_type: 'up' }
    ];

    // Insert comment votes
    for (const vote of commentVotes) {
      try {
        await runAsync(
          `INSERT INTO comment_votes (comment_id, user_id, vote_type) 
           VALUES (?, ?, ?)`,
          [vote.comment_id, vote.user_id, vote.vote_type]
        );
      } catch (error) {
        // Skip duplicate votes that violate the UNIQUE constraint
        if (!(error instanceof Error && error.message.includes('UNIQUE constraint failed'))) {
          throw error;
        }
      }
    }
    console.log('✅ Sample comment votes created');

    // Insert bookmarks
    const bookmarks = [
      { event_id: 2, user_id: 1 },
      { event_id: 3, user_id: 2 },
      { event_id: 4, user_id: 3 },
      { event_id: 5, user_id: 4 },
      { event_id: 6, user_id: 5 },
      { event_id: 7, user_id: 6 },
      { event_id: 8, user_id: 7 },
      { event_id: 9, user_id: 8 },
      { event_id: 10, user_id: 9 },
      { event_id: 11, user_id: 10 },
      { event_id: 12, user_id: 11 },
      { event_id: 13, user_id: 12 },
      { event_id: 14, user_id: 13 },
      { event_id: 15, user_id: 14 },
      { event_id: 16, user_id: 15 },
      { event_id: 17, user_id: 1 },
      { event_id: 18, user_id: 2 },
      { event_id: 19, user_id: 3 },
      { event_id: 20, user_id: 4 },
      { event_id: 1, user_id: 5 },
      { event_id: 2, user_id: 6 },
      { event_id: 3, user_id: 7 },
      { event_id: 4, user_id: 8 },
      { event_id: 5, user_id: 9 },
      { event_id: 6, user_id: 10 },
      { event_id: 7, user_id: 11 },
      { event_id: 8, user_id: 12 },
      { event_id: 9, user_id: 13 },
      { event_id: 10, user_id: 14 },
      { event_id: 11, user_id: 15 }
    ];

    // Insert bookmarks
    for (const bookmark of bookmarks) {
      await runAsync(
        `INSERT INTO bookmarks (event_id, user_id) 
         VALUES (?, ?)`,
        [bookmark.event_id, bookmark.user_id]
      );
    }
    console.log('✅ Sample bookmarks created');

    // Add sample notifications
    const notifications = [
      { user_id: 1, type: 'event_invite', content: "You have been invited to join Basketball Pickup Game", related_id: 3, is_read: 0 },
      { user_id: 1, type: 'comment', content: "Jane commented on your event: \"Looking forward to this game!\"", related_id: 1, is_read: 1 },
      { user_id: 1, type: 'join_request', content: "Mike wants to join your Morning Yoga Session event", related_id: 4, is_read: 0 },
      { user_id: 1, type: 'event_update', content: "Weekend Football Match details have been updated", related_id: 1, is_read: 0 },
      { user_id: 1, type: 'event_reminder', content: "Reminder: Morning Yoga Session starts tomorrow", related_id: 4, is_read: 0 },
      
      { user_id: 2, type: 'join_accepted', content: "Your request to join Weekend Football Match has been accepted", related_id: 1, is_read: 0 },
      { user_id: 2, type: 'event_reminder', content: "Reminder: Basketball Pickup Game starts in 24 hours", related_id: 3, is_read: 0 },
      { user_id: 2, type: 'event_invite', content: "You have been invited to join Triathlon Training Group", related_id: 7, is_read: 1 },
      { user_id: 2, type: 'comment', content: "John commented on Tennis Tournament: \"What's the prize for the winner?\"", related_id: 2, is_read: 0 },
      { user_id: 2, type: 'event_update', content: "Tennis Tournament location has been changed", related_id: 2, is_read: 1 },
      
      { user_id: 3, type: 'event_update', content: "Tennis Tournament details have been updated", related_id: 2, is_read: 1 },
      { user_id: 3, type: 'system', content: "Welcome to KickMates! Complete your profile to get started.", related_id: null, is_read: 0 },
      { user_id: 3, type: 'event_reminder', content: "Reminder: Basketball Pickup Game starts in 2 hours", related_id: 3, is_read: 0 },
      { user_id: 3, type: 'join_accepted', content: "Your request to join Rugby Practice Match has been accepted", related_id: 8, is_read: 1 },
      { user_id: 3, type: 'event_invite', content: "You have been invited to join Touch Rugby for Beginners", related_id: 20, is_read: 0 },
      
      { user_id: 4, type: 'event_reminder', content: "Reminder: Morning Yoga Session starts tomorrow", related_id: 4, is_read: 1 },
      { user_id: 4, type: 'join_accepted', content: "Your request to join Advanced Yoga Workshop has been accepted", related_id: 5, is_read: 0 },
      { user_id: 4, type: 'comment', content: "John replied to your comment on Morning Yoga Session", related_id: 4, is_read: 0 },
      { user_id: 4, type: 'event_invite', content: "You have been invited to join Triathlon Training Group", related_id: 7, is_read: 0 },
      { user_id: 4, type: 'event_update', content: "Advanced Yoga Workshop time has been changed", related_id: 5, is_read: 1 },
      
      { user_id: 5, type: 'join_request', content: "Jane wants to join your Sunday Soccer League event", related_id: 6, is_read: 0 },
      { user_id: 5, type: 'comment', content: "John commented on your event: \"How many players per team?\"", related_id: 6, is_read: 1 },
      { user_id: 5, type: 'join_accepted', content: "Your request to join Rugby Practice Match has been accepted", related_id: 8, is_read: 0 },
      { user_id: 5, type: 'event_reminder', content: "Reminder: Sunday Soccer League starts in 24 hours", related_id: 6, is_read: 0 },
      { user_id: 5, type: 'event_invite', content: "You have been invited to join Rock Climbing Workshop", related_id: 11, is_read: 0 },
      
      { user_id: 6, type: 'event_update', content: "Triathlon Training Group location has been changed", related_id: 7, is_read: 0 },
      { user_id: 6, type: 'join_request', content: "David wants to join your Triathlon Training Group event", related_id: 7, is_read: 1 },
      { user_id: 6, type: 'comment', content: "Sarah replied to your comment on Advanced Yoga Workshop", related_id: 5, is_read: 0 },
      { user_id: 6, type: 'event_reminder', content: "Reminder: Triathlon Training Group starts tomorrow", related_id: 7, is_read: 0 },
      { user_id: 6, type: 'join_accepted', content: "Your request to join Tennis Coaching Clinic has been accepted", related_id: 19, is_read: 1 },
      
      { user_id: 7, type: 'join_request', content: "Lisa wants to join your Rugby Practice Match event", related_id: 8, is_read: 0 },
      { user_id: 7, type: 'comment', content: "John commented on your event: \"Is this touch or full contact rugby?\"", related_id: 8, is_read: 1 },
      { user_id: 7, type: 'event_invite', content: "You have been invited to join Indoor 5-a-side Football", related_id: 18, is_read: 0 },
      { user_id: 7, type: 'event_reminder', content: "Reminder: Rugby Practice Match starts in 24 hours", related_id: 8, is_read: 0 },
      { user_id: 7, type: 'join_accepted', content: "Your request to join Marathon Training Run has been accepted", related_id: 13, is_read: 1 },
      
      { user_id: 8, type: 'event_update', content: "Volleyball Beach Tournament time has been changed", related_id: 9, is_read: 0 },
      { user_id: 8, type: 'join_request', content: "Kevin wants to join your Volleyball Beach Tournament event", related_id: 9, is_read: 1 },
      { user_id: 8, type: 'comment', content: "Jane commented on your event: \"What's the format of the tournament?\"", related_id: 9, is_read: 0 },
      { user_id: 8, type: 'event_reminder', content: "Reminder: Volleyball Beach Tournament starts in 48 hours", related_id: 9, is_read: 0 },
      { user_id: 8, type: 'event_invite', content: "You have been invited to join Basketball Pickup Game", related_id: 3, is_read: 1 },
      
      { user_id: 9, type: 'join_request', content: "Ryan wants to join your Cycling Group Ride event", related_id: 10, is_read: 0 },
      { user_id: 9, type: 'comment', content: "John commented on your event: \"What's the terrain like on this route?\"", related_id: 10, is_read: 1 },
      { user_id: 9, type: 'event_invite', content: "You have been invited to join Sunday Soccer League", related_id: 6, is_read: 0 },
      { user_id: 9, type: 'event_reminder', content: "Reminder: Cycling Group Ride starts tomorrow", related_id: 10, is_read: 0 },
      { user_id: 9, type: 'join_accepted', content: "Your request to join Marathon Training Run has been accepted", related_id: 13, is_read: 1 },
      
      { user_id: 10, type: 'event_update', content: "Rock Climbing Workshop details have been updated", related_id: 11, is_read: 0 },
      { user_id: 10, type: 'join_request', content: "Olivia wants to join your Rock Climbing Workshop event", related_id: 11, is_read: 1 },
      { user_id: 10, type: 'comment', content: "Jane commented on your event: \"Is the workshop suitable for complete beginners?\"", related_id: 11, is_read: 0 },
      { user_id: 10, type: 'event_reminder', content: "Reminder: Rock Climbing Workshop starts in 24 hours", related_id: 11, is_read: 0 },
      { user_id: 10, type: 'event_invite', content: "You have been invited to join Golf Day Out", related_id: 16, is_read: 1 },
      
      { user_id: 11, type: 'join_request', content: "Michelle wants to join your Baseball Pickup Game event", related_id: 12, is_read: 0 },
      { user_id: 11, type: 'comment', content: "John commented on your event: \"Are gloves provided or should I bring my own?\"", related_id: 12, is_read: 1 },
      { user_id: 11, type: 'event_invite', content: "You have been invited to join Rugby Practice Match", related_id: 8, is_read: 0 },
      { user_id: 11, type: 'event_reminder', content: "Reminder: Baseball Pickup Game starts tomorrow", related_id: 12, is_read: 0 },
      { user_id: 11, type: 'join_accepted', content: "Your request to join Pro Basketball Training Session has been accepted", related_id: 17, is_read: 1 },
      
      { user_id: 12, type: 'event_update', content: "Marathon Training Run location has been changed", related_id: 13, is_read: 0 },
      { user_id: 12, type: 'join_request', content: "Ryan wants to join your Marathon Training Run event", related_id: 13, is_read: 1 },
      { user_id: 12, type: 'comment', content: "Jane commented on your event: \"What pace will we be running at?\"", related_id: 13, is_read: 0 },
      { user_id: 12, type: 'event_reminder', content: "Reminder: Marathon Training Run starts in 24 hours", related_id: 13, is_read: 0 },
      { user_id: 12, type: 'event_invite', content: "You have been invited to join Morning Yoga Session", related_id: 4, is_read: 1 },
      
      { user_id: 13, type: 'join_request', content: "Olivia wants to join your Snowboarding Weekend event", related_id: 14, is_read: 0 },
      { user_id: 13, type: 'comment', content: "John commented on your event: \"What ability level is needed for this trip?\"", related_id: 14, is_read: 1 },
      { user_id: 13, type: 'event_invite', content: "You have been invited to join Pro Basketball Training Session", related_id: 17, is_read: 0 },
      { user_id: 13, type: 'event_reminder', content: "Reminder: Snowboarding Weekend starts in 48 hours", related_id: 14, is_read: 0 },
      { user_id: 13, type: 'join_accepted', content: "Your request to join Tennis Tournament has been accepted", related_id: 2, is_read: 1 },
      
      { user_id: 14, type: 'event_update', content: "Badminton Doubles Tournament details have been updated", related_id: 15, is_read: 0 },
      { user_id: 14, type: 'join_request', content: "Jason wants to join your Badminton Doubles Tournament event", related_id: 15, is_read: 1 },
      { user_id: 14, type: 'comment', content: "Jane commented on your event: \"How will partners be assigned?\"", related_id: 15, is_read: 0 },
      { user_id: 14, type: 'event_reminder', content: "Reminder: Badminton Doubles Tournament starts tomorrow", related_id: 15, is_read: 0 },
      { user_id: 14, type: 'event_invite', content: "You have been invited to join Tennis Coaching Clinic", related_id: 19, is_read: 1 },
      
      { user_id: 15, type: 'join_request', content: "Mike wants to join your Golf Day Out event", related_id: 16, is_read: 0 },
      { user_id: 15, type: 'comment', content: "John commented on your event: \"Should I bring my own golf balls?\"", related_id: 16, is_read: 1 },
      { user_id: 15, type: 'event_invite', content: "You have been invited to join Touch Rugby for Beginners", related_id: 20, is_read: 0 },
      { user_id: 15, type: 'event_reminder', content: "Reminder: Golf Day Out starts tomorrow", related_id: 16, is_read: 0 },
      { user_id: 15, type: 'join_accepted', content: "Your request to join Badminton Doubles Tournament has been accepted", related_id: 15, is_read: 1 }
    ];

    // Insert notifications
    for (const notification of notifications) {
      await runAsync(
        `INSERT INTO notifications (user_id, type, content, related_id, is_read) 
         VALUES (?, ?, ?, ?, ?)`,
        [notification.user_id, notification.type, notification.content, notification.related_id, notification.is_read]
      );
    }
    console.log('✅ Sample notifications created');

    // Create sample conversations
    const conversations = [
      { id: 1 }, // John & Jane
      { id: 2 }, // John & Mike
      { id: 3 }, // John & Sarah
      { id: 4 }, // Jane & Mike
      { id: 5 }  // Group chat (John, Jane, Mike)
    ];

    for (const conversation of conversations) {
      await runAsync(`INSERT INTO conversations (id) VALUES (?)`, [conversation.id]);
    }
    console.log('✅ Sample conversations created');

    // Create conversation participants
    const conversationParticipants = [
      { conversation_id: 1, user_id: 1 }, // John in convo 1
      { conversation_id: 1, user_id: 2 }, // Jane in convo 1
      { conversation_id: 2, user_id: 1 }, // John in convo 2
      { conversation_id: 2, user_id: 3 }, // Mike in convo 2
      { conversation_id: 3, user_id: 1 }, // John in convo 3
      { conversation_id: 3, user_id: 4 }, // Sarah in convo 3
      { conversation_id: 4, user_id: 2 }, // Jane in convo 4
      { conversation_id: 4, user_id: 3 }, // Mike in convo 4
      { conversation_id: 5, user_id: 1 }, // John in convo 5
      { conversation_id: 5, user_id: 2 }, // Jane in convo 5
      { conversation_id: 5, user_id: 3 }  // Mike in convo 5
    ];

    for (const participant of conversationParticipants) {
      await runAsync(
        `INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)`,
        [participant.conversation_id, participant.user_id]
      );
    }
    console.log('✅ Sample conversation participants created');

    // Create sample messages
    const now = new Date();
    const oneHourAgo = new Date(now);
    oneHourAgo.setHours(now.getHours() - 1);
    
    const twoHoursAgo = new Date(now);
    twoHoursAgo.setHours(now.getHours() - 2);
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(now.getDate() - 2);
    
    const lastWeek = new Date(now);
    lastWeek.setDate(now.getDate() - 7);

    const messages = [
      // Conversation 1 (John & Jane)
      {
        conversation_id: 1,
        sender_id: 2, // Jane
        content: "Hey there! How are you doing today?",
        created_at: twoDaysAgo.toISOString(),
        is_read: 1
      },
      {
        conversation_id: 1,
        sender_id: 1, // John
        content: "I'm good, thanks! Just finishing up some work.",
        created_at: twoDaysAgo.toISOString(),
        is_read: 1
      },
      {
        conversation_id: 1,
        sender_id: 2, // Jane
        content: "Are we still meeting today for the basketball practice?",
        created_at: yesterday.toISOString(),
        is_read: 1
      },
      {
        conversation_id: 1,
        sender_id: 1, // John
        content: "Yes, definitely! I was thinking 5pm at the usual court, does that work for you?",
        created_at: yesterday.toISOString(),
        is_read: 1
      },
      {
        conversation_id: 1,
        sender_id: 2, // Jane
        content: "Perfect. I invited a couple more players to join us if that's okay.",
        created_at: twoHoursAgo.toISOString(),
        is_read: 1
      },
      {
        conversation_id: 1,
        sender_id: 1, // John
        content: "That's great! The more the merrier. Should we get some drinks for after?",
        created_at: oneHourAgo.toISOString(),
        is_read: 0
      },

      // Conversation 2 (John & Mike)
      {
        conversation_id: 2,
        sender_id: 3, // Mike
        content: "Did you see the game last night?",
        created_at: yesterday.toISOString(),
        is_read: 1
      },
      {
        conversation_id: 2,
        sender_id: 1, // John
        content: "Yes! It was incredible. Our team played really well.",
        created_at: yesterday.toISOString(),
        is_read: 1
      },
      {
        conversation_id: 2,
        sender_id: 3, // Mike
        content: "That last-minute shot was unbelievable!",
        created_at: twoHoursAgo.toISOString(),
        is_read: 0
      },

      // Conversation 3 (John & Sarah)
      {
        conversation_id: 3,
        sender_id: 4, // Sarah
        content: "Hey, do you want to play tennis this weekend?",
        created_at: twoDaysAgo.toISOString(),
        is_read: 1
      },
      {
        conversation_id: 3,
        sender_id: 1, // John
        content: "I'd love to! How about Saturday morning?",
        created_at: twoDaysAgo.toISOString(),
        is_read: 1
      },
      {
        conversation_id: 3,
        sender_id: 4, // Sarah
        content: "Saturday works for me. 10am?",
        created_at: yesterday.toISOString(),
        is_read: 1
      },
      {
        conversation_id: 3,
        sender_id: 1, // John
        content: "Perfect, see you then!",
        created_at: yesterday.toISOString(),
        is_read: 1
      },

      // Conversation 4 (Jane & Mike)
      {
        conversation_id: 4,
        sender_id: 2, // Jane
        content: "Thanks for organizing the soccer match last week!",
        created_at: lastWeek.toISOString(),
        is_read: 1
      },
      {
        conversation_id: 4,
        sender_id: 3, // Mike
        content: "No problem! It was a lot of fun.",
        created_at: lastWeek.toISOString(),
        is_read: 1
      },
      {
        conversation_id: 4,
        sender_id: 2, // Jane
        content: "Let me know when you plan the next one. I want to join again!",
        created_at: twoDaysAgo.toISOString(),
        is_read: 1
      },

      // Conversation 5 (Group: John, Jane, Mike)
      {
        conversation_id: 5,
        sender_id: 1, // John
        content: "Hey everyone! I'm planning a basketball game this weekend. Who's in?",
        created_at: twoDaysAgo.toISOString(),
        is_read: 1
      },
      {
        conversation_id: 5,
        sender_id: 2, // Jane
        content: "Count me in! What time are you thinking?",
        created_at: twoDaysAgo.toISOString(),
        is_read: 1
      },
      {
        conversation_id: 5,
        sender_id: 3, // Mike
        content: "I should be available. Where will we play?",
        created_at: yesterday.toISOString(),
        is_read: 1
      },
      {
        conversation_id: 5,
        sender_id: 1, // John
        content: "Great! Saturday at 3pm at Central Park courts. I'll bring the balls.",
        created_at: yesterday.toISOString(),
        is_read: 1
      },
      {
        conversation_id: 5,
        sender_id: 2, // Jane
        content: "Perfect. I'll bring some water and snacks.",
        created_at: oneHourAgo.toISOString(),
        is_read: 0
      }
    ];

    for (const message of messages) {
      await runAsync(
        `INSERT INTO messages (conversation_id, sender_id, content, created_at, is_read) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          message.conversation_id,
          message.sender_id,
          message.content,
          message.created_at,
          message.is_read
        ]
      );
    }
    console.log('✅ Sample messages created');

    // Update conversation timestamps to match the latest message
    for (const conversation of conversations) {
      const latestMessage = await getAsync(
        `SELECT created_at FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 1`,
        [conversation.id]
      );
      
      if (latestMessage) {
        await runAsync(
          `UPDATE conversations SET updated_at = ? WHERE id = ?`,
          [latestMessage.created_at, conversation.id]
        );
      }
    }
    console.log('✅ Conversation timestamps updated');

    // Insert dashboard related data
    try {
      // Create dashboard_courses table
      await runAsync(`
        CREATE TABLE IF NOT EXISTS dashboard_courses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          instructor TEXT NOT NULL,
          instructor_avatar TEXT NOT NULL,
          level TEXT NOT NULL,
          rating REAL NOT NULL,
          attendees INTEGER NOT NULL,
          image_url TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create user_courses table
      await runAsync(`
        CREATE TABLE IF NOT EXISTS user_courses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          sessions_completed INTEGER NOT NULL,
          total_sessions INTEGER NOT NULL,
          image_url TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Create course_participants table
      await runAsync(`
        CREATE TABLE IF NOT EXISTS course_participants (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          course_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (course_id) REFERENCES user_courses (id),
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Create user_statistics table
      await runAsync(`
        CREATE TABLE IF NOT EXISTS user_statistics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          score INTEGER NOT NULL,
          score_change TEXT NOT NULL,
          completed_hours INTEGER NOT NULL,
          completed_hours_change TEXT NOT NULL,
          total_students INTEGER NOT NULL,
          total_students_change TEXT NOT NULL,
          total_hours INTEGER NOT NULL,
          total_hours_change TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Create productivity_data table
      await runAsync(`
        CREATE TABLE IF NOT EXISTS productivity_data (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          day TEXT NOT NULL,
          mentoring INTEGER NOT NULL,
          self_improve INTEGER NOT NULL,
          student INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Create upcoming_events table
      await runAsync(`
        CREATE TABLE IF NOT EXISTS upcoming_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          type TEXT NOT NULL,
          event_date TEXT NOT NULL,
          event_time TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Seed dashboard_courses
      const dashboardCourses = [
        {
          title: 'Three-month Course to Learn the Basics of Soccer and Start Playing',
          instructor: 'Alison Walsh',
          instructor_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
          level: 'Beginner',
          rating: 5.0,
          attendees: 118,
          image_url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55'
        },
        {
          title: 'Beginner\'s Guide to Team Sports: Basketball & More',
          instructor: 'Patty Kutch',
          instructor_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
          level: 'Beginner',
          rating: 4.8,
          attendees: 234,
          image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc'
        },
        {
          title: 'Introduction: Proper Training Techniques and Practice',
          instructor: 'Alonzo Murray',
          instructor_avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5',
          level: 'Intermediate',
          rating: 4.9,
          attendees: 57,
          image_url: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b'
        },
        {
          title: 'Advanced Training Methods and Techniques',
          instructor: 'Gregory Harris',
          instructor_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
          level: 'Advanced',
          rating: 5.0,
          attendees: 19,
          image_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9'
        }
      ];

      for (const course of dashboardCourses) {
        await runAsync(
          `INSERT INTO dashboard_courses (
            title, instructor, instructor_avatar, level, rating, attendees, image_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            course.title,
            course.instructor,
            course.instructor_avatar,
            course.level,
            course.rating,
            course.attendees,
            course.image_url
          ]
        );
      }
      console.log('✅ Dashboard courses created');

      // Seed user_courses for user 1
      const userCourses = [
        {
          user_id: 1,
          title: 'Football Training',
          sessions_completed: 9,
          total_sessions: 12,
          image_url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55'
        },
        {
          user_id: 1,
          title: 'Basketball Skills',
          sessions_completed: 16,
          total_sessions: 24,
          image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc'
        },
        {
          user_id: 1,
          title: 'Training Techniques',
          sessions_completed: 11,
          total_sessions: 18,
          image_url: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b'
        },
        {
          user_id: 1,
          title: 'Team Development',
          sessions_completed: 18,
          total_sessions: 37,
          image_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9'
        }
      ];

      for (const course of userCourses) {
        const result = await runAsync(
          `INSERT INTO user_courses (
            user_id, title, sessions_completed, total_sessions, image_url
          ) VALUES (?, ?, ?, ?, ?)`,
          [
            course.user_id,
            course.title,
            course.sessions_completed,
            course.total_sessions,
            course.image_url
          ]
        );
        
        // Add participants to each course
        const participants = [1, 2, 3, 4, 5, 6].slice(0, Math.floor(Math.random() * 3) + 3);
        
        for (const participant of participants) {
          await runAsync(
            `INSERT INTO course_participants (course_id, user_id) VALUES (?, ?)`,
            [result.lastID, participant]
          );
        }
      }
      console.log('✅ User courses and participants created');

      // Seed user_statistics for user 1
      await runAsync(
        `INSERT INTO user_statistics (
          user_id, score, score_change, completed_hours, completed_hours_change,
          total_students, total_students_change, total_hours, total_hours_change
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [1, 210, '+15%', 34, '+15%', 17, '-2%', 11, '-9%']
      );
      console.log('✅ User statistics created');

      // Seed productivity_data for user 1
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const mentoring = [25, 75, 25, 25, 25, 0, 25];
      const selfImprove = [50, 90, 50, 50, 50, 25, 50];
      const student = [75, 90, 75, 75, 75, 50, 90];

      for (let i = 0; i < days.length; i++) {
        await runAsync(
          `INSERT INTO productivity_data (
            user_id, day, mentoring, self_improve, student
          ) VALUES (?, ?, ?, ?, ?)`,
          [1, days[i], mentoring[i], selfImprove[i], student[i]]
        );
      }
      console.log('✅ Productivity data created');

      // Seed upcoming_events for user 1
      const upcomingEvents = [
        {
          user_id: 1,
          title: 'Business Prospect Analysis',
          type: 'Course',
          event_date: 'April 25',
          event_time: '11:00-12:00'
        },
        {
          user_id: 1,
          title: 'AI & Virtual Reality: Intro',
          type: 'Tutoring',
          event_date: 'April 27',
          event_time: '14:30-15:30'
        }
      ];

      for (const event of upcomingEvents) {
        await runAsync(
          `INSERT INTO upcoming_events (
            user_id, title, type, event_date, event_time
          ) VALUES (?, ?, ?, ?, ?)`,
          [
            event.user_id,
            event.title,
            event.type,
            event.event_date,
            event.event_time
          ]
        );
      }
      console.log('✅ Upcoming events created');
      
      // Insert discussions
      const discussions = [
        {
          title: 'Best basketball shoes for outdoor courts?',
          content: 'I\'ve been playing outdoor basketball a lot lately and my shoes are starting to fall apart. What are your recommendations for durable outdoor basketball shoes with good grip and ankle support?',
          category: 'Basketball',
          creator_id: 1,
          votes_up: 15,
          votes_down: 2,
          image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc'
        },
        {
          title: 'Running group meetups in downtown area',
          content: 'Hey runners! I\'m looking to start a regular running group in the downtown area. Thinking of meeting 3 times a week (Mon/Wed/Fri) around 6pm for a 5K run. Would anyone be interested in joining? Let me know what you think about the schedule too.',
          category: 'Running',
          creator_id: 2,
          votes_up: 23,
          votes_down: 0,
          image_url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5'
        },
        {
          title: 'Tennis court conditions after the rain',
          content: 'Has anyone checked out the public tennis courts at Central Park after all the rain we got this week? Wondering if they\'re playable yet or still too wet. Planning to play this weekend.',
          category: 'Tennis',
          creator_id: 3,
          votes_up: 8,
          votes_down: 1,
          image_url: null
        },
        {
          title: 'Advice for first-time marathon training',
          content: 'I just signed up for my first marathon (happening in 4 months) and I\'m looking for training advice. Any recommended training plans, nutrition tips, or gear suggestions would be greatly appreciated!',
          category: 'Running',
          creator_id: 1,
          votes_up: 31,
          votes_down: 3,
          image_url: 'https://images.unsplash.com/photo-1516731415730-0c607149933a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        },
        {
          title: 'Where to play soccer on weekday evenings?',
          content: 'Just moved to the area and looking for places to play soccer on weekday evenings. Ideally looking for pickup games or casual leagues where I can join as an individual player. Any suggestions?',
          category: 'Soccer',
          creator_id: 2,
          votes_up: 12,
          votes_down: 0,
          image_url: null
        }
      ];

      // Insert discussions
      for (const discussion of discussions) {
        await runAsync(
          `INSERT INTO discussions (title, content, category, creator_id, votes_up, votes_down, image_url)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [discussion.title, discussion.content, discussion.category, discussion.creator_id, 
           discussion.votes_up, discussion.votes_down, discussion.image_url]
        );
      }
      console.log('✅ Sample discussions created');

      // Insert discussion votes
      const discussionVotes = [
        { discussion_id: 1, user_id: 2, vote_type: 'up' },
        { discussion_id: 1, user_id: 3, vote_type: 'up' },
        { discussion_id: 2, user_id: 1, vote_type: 'up' },
        { discussion_id: 2, user_id: 3, vote_type: 'up' },
        { discussion_id: 3, user_id: 1, vote_type: 'up' },
        { discussion_id: 3, user_id: 2, vote_type: 'down' },
        { discussion_id: 4, user_id: 2, vote_type: 'up' },
        { discussion_id: 4, user_id: 3, vote_type: 'up' },
        { discussion_id: 5, user_id: 1, vote_type: 'up' },
        { discussion_id: 5, user_id: 3, vote_type: 'up' }
      ];

      for (const vote of discussionVotes) {
        await runAsync(
          `INSERT INTO discussion_votes (discussion_id, user_id, vote_type)
          VALUES (?, ?, ?)`,
          [vote.discussion_id, vote.user_id, vote.vote_type]
        );
      }
      console.log('✅ Sample discussion votes created');

      // Insert discussion comments
      const discussionComments = [
        {
          discussion_id: 1,
          user_id: 2,
          content: 'I really like the Nike Lebron Witness series for outdoor courts. They\'re durable and have great traction.',
          parent_comment_id: null,
          thumbs_up: 5,
          thumbs_down: 0
        },
        {
          discussion_id: 1,
          user_id: 3,
          content: 'Adidas Dame series is also great for outdoors. More affordable than some other options and last a long time.',
          parent_comment_id: null,
          thumbs_up: 3,
          thumbs_down: 1
        },
        {
          discussion_id: 1,
          user_id: 1,
          content: 'Thanks for the suggestion! Have you tried the latest Dame model?',
          parent_comment_id: 2,
          thumbs_up: 1,
          thumbs_down: 0
        },
        {
          discussion_id: 1,
          user_id: 3,
          content: 'Yes, I have the Dame 8 and they\'re great. Very comfortable and the traction is excellent even on dusty courts.',
          parent_comment_id: 3,
          thumbs_up: 2,
          thumbs_down: 0
        },
        {
          discussion_id: 2,
          user_id: 1,
          content: 'This sounds great! I\'d definitely be interested in joining. The schedule works perfect for me.',
          parent_comment_id: null,
          thumbs_up: 2,
          thumbs_down: 0
        },
        {
          discussion_id: 2,
          user_id: 3,
          content: 'I could join on Mondays and Fridays, but Wednesdays are tough for me. Would you consider a Tuesday instead?',
          parent_comment_id: null,
          thumbs_up: 1,
          thumbs_down: 0
        },
        {
          discussion_id: 2,
          user_id: 2,
          content: 'Tuesday could work! Let\'s see what others think as well.',
          parent_comment_id: 6,
          thumbs_up: 1,
          thumbs_down: 0
        },
        {
          discussion_id: 3,
          user_id: 1,
          content: 'I was there yesterday and the courts were still quite wet. They might be okay by Sunday, but I\'d avoid Saturday if possible.',
          parent_comment_id: null,
          thumbs_up: 4,
          thumbs_down: 0
        },
        {
          discussion_id: 4,
          user_id: 2,
          content: 'Hal Higdon has some great beginner marathon training plans. I used his Novice 1 plan for my first marathon and it worked really well!',
          parent_comment_id: null,
          thumbs_up: 7,
          thumbs_down: 0
        },
        {
          discussion_id: 4,
          user_id: 3,
          content: 'For nutrition, make sure you practice your race-day fueling during your long runs. Don\'t try anything new on race day!',
          parent_comment_id: null,
          thumbs_up: 5,
          thumbs_down: 0
        },
        {
          discussion_id: 4,
          user_id: 1,
          content: 'Thanks for the tips! What kind of gels or fuel do you recommend?',
          parent_comment_id: 10,
          thumbs_up: 1,
          thumbs_down: 0
        },
        {
          discussion_id: 5,
          user_id: 3,
          content: 'Check out Riverfront Park on Tuesday and Thursday evenings. There\'s a regular pickup game that starts around 6:30pm.',
          parent_comment_id: null,
          thumbs_up: 2,
          thumbs_down: 0
        }
      ];

      for (const comment of discussionComments) {
        await runAsync(
          `INSERT INTO comments (discussion_id, user_id, content, parent_comment_id, thumbs_up, thumbs_down)
          VALUES (?, ?, ?, ?, ?, ?)`,
          [comment.discussion_id, comment.user_id, comment.content, 
           comment.parent_comment_id, comment.thumbs_up, comment.thumbs_down]
        );
      }
      console.log('✅ Sample discussion comments created');

    } catch (error) {
      console.error('Error seeding dashboard data:', error);
    }

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    db.close();
  }
}

seedDatabase()
  .then(() => {
    console.log('Database connection closed');
  })
  .catch((err) => {
    console.error('Error seeding database:', err);
    db.close();
  }); 