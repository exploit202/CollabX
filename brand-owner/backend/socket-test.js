const { io } = require('socket.io-client');

const BRAND_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTdkNGQ2Y2IwYjUxYmE5NjczMjE0NmQiLCJlbWFpbCI6ImRhc2hib2FyZHRlc3QyMDI2QGdtYWlsLmNvbSIsInJvbGUiOiJicmFuZCIsImlhdCI6MTc4NjU5NjgwNywiZXhwIjoxNzg3MjAxNjA3fQ.rdjUeE-HFbsK8O3rHiqrkcLKdVehe6YjLmXdbyhgVl8';
const NEGOTIATION_ID = '6a7d7b88acd3e5ddbd63e36d';

const socket = io('http://localhost:5001', {
  auth: {
    token: BRAND_JWT
  }
});

socket.on('connect', () => {
  console.log('✅ Brand socket connected:', socket.id);

  socket.emit(
    'negotiation:join',
    NEGOTIATION_ID,
    (response) => {
      console.log('🏠 Join response:', response);
    }
  );
});

socket.on('negotiation:offer', (data) => {
  console.log('📩 OFFER RECEIVED:');
  console.log(JSON.stringify(data, null, 2));
});
socket.on('negotiation:status', (data) => {
  console.log('📩 NEGOTIATION STATUS RECEIVED:');
  console.log(JSON.stringify(data, null, 2));
});
socket.on('connect_error', (error) => {
  console.error('❌ Socket connection error:', error.message);

  if (error.data) {
    console.error('Details:', error.data);
  }
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Socket disconnected:', reason);
});