const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const CreatorProfile = require('../src/modules/creator/models/creatorProfile.model');

test('CreatorProfile validation accepts valid platformLinks', () => {
  const profile = new CreatorProfile({
    userId: new mongoose.Types.ObjectId(),
    platforms: ['instagram', 'youtube'],
    platformLinks: {
      instagram: 'https://instagram.com/myusername',
      youtube: 'https://youtube.com/c/mychannel',
      twitter: 'https://twitter.com/myhandle'
    }
  });

  const err = profile.validateSync();
  assert.equal(err, undefined);
});

test('CreatorProfile validation rejects invalid URLs in platformLinks', () => {
  const profile = new CreatorProfile({
    userId: new mongoose.Types.ObjectId(),
    platformLinks: {
      instagram: 'invalid-url-here',
      youtube: 'https://youtube.com/c/mychannel',
      twitter: 'https://twitter.com/myhandle'
    }
  });

  const err = profile.validateSync();
  assert.ok(err);
  assert.ok(err.errors['platformLinks.instagram']);
  assert.equal(err.errors['platformLinks.instagram'].message, 'Please provide a valid Instagram URL');
});
