import sqlite3 from 'sqlite3';
import { resolve } from 'path';
import bcrypt from 'bcrypt';

const dbPath = resolve(__dirname, '../../../data/kickmates.db');
const db = new sqlite3.Database(dbPath);

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function seedDatabase() {
  // Hash passwords
  const password1 = await hashPassword('password123');
  const password2 = await hashPassword('password456');
  const password3 = await hashPassword('password789');

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
    }
  ];

  return new Promise<void>((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      // Insert users
      const userStmt = db.prepare(
        `INSERT INTO users (username, email, password, full_name, bio, profile_image) 
         VALUES (?, ?, ?, ?, ?, ?)`
      );
      
      for (const user of users) {
        userStmt.run(
          user.username, 
          user.email, 
          user.password, 
          user.full_name, 
          user.bio, 
          user.profile_image
        );
      }
      userStmt.finalize();

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
          image_url: 'https://images.unsplash.com/photo-1595435934349-5c8a59929617'
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
          image_url: 'https://images.unsplash.com/photo-1546519638-68e109acd27d'
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
        }
      ];

      const eventStmt = db.prepare(
        `INSERT INTO events (creator_id, title, description, sport_type, location, start_date, end_date, max_players, current_players, image_url) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );
      
      for (const event of events) {
        eventStmt.run(
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
        );
      }
      eventStmt.finalize();

      // Insert participants
      const participants = [
        { event_id: 1, user_id: 1, status: 'confirmed' },
        { event_id: 1, user_id: 2, status: 'confirmed' },
        { event_id: 1, user_id: 3, status: 'confirmed' },
        { event_id: 2, user_id: 2, status: 'confirmed' },
        { event_id: 2, user_id: 3, status: 'confirmed' },
        { event_id: 3, user_id: 3, status: 'confirmed' },
        { event_id: 3, user_id: 1, status: 'confirmed' },
        { event_id: 4, user_id: 1, status: 'confirmed' },
        { event_id: 4, user_id: 2, status: 'waiting' }
      ];

      const participantStmt = db.prepare(
        `INSERT INTO participants (event_id, user_id, status) VALUES (?, ?, ?)`
      );
      
      for (const participant of participants) {
        participantStmt.run(
          participant.event_id, 
          participant.user_id, 
          participant.status
        );
      }
      participantStmt.finalize();

      // Insert comments
      const comments = [
        { event_id: 1, user_id: 2, content: 'Looking forward to this match!' },
        { event_id: 1, user_id: 3, content: 'Should we bring our own balls?' },
        { event_id: 1, user_id: 1, content: 'Yes, please bring a ball if you have one.' },
        { event_id: 2, user_id: 3, content: "What's the prize for the winner?" },
        { event_id: 3, user_id: 1, content: 'Is there parking available nearby?' },
        { event_id: 3, user_id: 3, content: "Yes, there's a parking lot right next to the center." },
        { event_id: 4, user_id: 2, content: 'Should we bring our own yoga mats?' },
        { event_id: 4, user_id: 1, content: 'Mats are provided, but feel free to bring your own if preferred.' }
      ];

      const commentStmt = db.prepare(
        `INSERT INTO comments (event_id, user_id, content) VALUES (?, ?, ?)`
      );
      
      for (const comment of comments) {
        commentStmt.run(
          comment.event_id, 
          comment.user_id, 
          comment.content
        );
      }
      commentStmt.finalize();

      // Insert bookmarks
      const bookmarks = [
        { event_id: 2, user_id: 1 },
        { event_id: 3, user_id: 2 },
        { event_id: 4, user_id: 3 }
      ];

      const bookmarkStmt = db.prepare(
        `INSERT INTO bookmarks (event_id, user_id) VALUES (?, ?)`
      );
      
      for (const bookmark of bookmarks) {
        bookmarkStmt.run(
          bookmark.event_id, 
          bookmark.user_id
        );
      }
      bookmarkStmt.finalize();

      db.run('COMMIT', (err) => {
        if (err) {
          console.error('Error committing transaction:', err);
          db.run('ROLLBACK');
          reject(err);
        } else {
          console.log('Database seeded successfully');
          resolve();
        }
      });
    });
  });
}

seedDatabase()
  .then(() => {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed');
      }
    });
  })
  .catch((err) => {
    console.error('Error seeding database:', err);
    db.close();
  }); 