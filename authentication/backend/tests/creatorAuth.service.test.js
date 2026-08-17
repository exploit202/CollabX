const test = require('node:test');
const assert = require('node:assert/strict');
const { mock } = require('node:test');

const User = require('../src/modules/auth/models/user.model');
const CreatorProfile = require('../src/modules/creator/models/creatorProfile.model');
const creatorAuthService = require('../src/modules/creator/services/creatorAuth.service');

test('markRegistrationCompleted successfully completes creator registration', async () => {
  const mockUserDoc = {
    _id: 'creator-user-id',
    fullName: 'Jane Doe',
    email: 'creator@example.com',
    password: 'hashedpassword',
    role: 'creator',
    isVerified: false,
    registrationStatus: 'pending',
    save: async function () {
      this.isSaved = true;
      return this;
    },
    toObject: function () {
      return {
        _id: this._id,
        fullName: this.fullName,
        email: this.email,
        password: this.password,
        role: this.role,
        isVerified: this.isVerified,
        registrationStatus: this.registrationStatus
      };
    }
  };

  const userFindByIdMock = mock.method(User, 'findById', async (id) => {
    assert.equal(id, 'creator-user-id');
    return mockUserDoc;
  });

  try {
    const result = await creatorAuthService.markRegistrationCompleted('creator-user-id');

    assert.equal(result.isVerified, true);
    assert.equal(result.registrationStatus, 'completed');
    assert.equal(result.password, undefined);
    assert.equal(result.fullName, 'Jane Doe');
    assert.equal(result.email, 'creator@example.com');
  } finally {
    userFindByIdMock.mock.restore();
  }
});

test('markRegistrationCompleted throws 404 when user is not found', async () => {
  const userFindByIdMock = mock.method(User, 'findById', async () => null);

  try {
    await assert.rejects(
      () => creatorAuthService.markRegistrationCompleted('non-existent-id'),
      (error) => {
        assert.equal(error.statusCode, 404);
        assert.equal(error.code, 'USER_NOT_FOUND');
        assert.equal(error.message, 'User not found');
        return true;
      }
    );
  } finally {
    userFindByIdMock.mock.restore();
  }
});

test('markRegistrationCompleted throws 403 when user is not a creator', async () => {
  const mockUserDoc = {
    _id: 'brand-user-id',
    role: 'brand',
    isVerified: false,
    registrationStatus: 'pending'
  };

  const userFindByIdMock = mock.method(User, 'findById', async () => mockUserDoc);

  try {
    await assert.rejects(
      () => creatorAuthService.markRegistrationCompleted('brand-user-id'),
      (error) => {
        assert.equal(error.statusCode, 403);
        assert.equal(error.code, 'INVALID_USER_ROLE');
        assert.equal(error.message, 'Only creator accounts can complete registration');
        return true;
      }
    );
  } finally {
    userFindByIdMock.mock.restore();
  }
});

test('updateCreatorPlatforms updates the existing creator profile', async () => {
  const mockProfileDoc = {
    _id: 'profile-id',
    userId: 'creator-user-id',
    platforms: [],
    niche: ['Tech'],
    followers: 0,
    engagementRate: 0,
    portfolio: [],
    save: async function () {
      this.saved = true;
      return this;
    },
    toObject: function () {
      return {
        _id: this._id,
        userId: this.userId,
        platforms: this.platforms,
        niche: this.niche,
        followers: this.followers,
        engagementRate: this.engagementRate,
        portfolio: this.portfolio
      };
    }
  };

  const profileFindOneMock = mock.method(CreatorProfile, 'findOne', async (query) => {
    assert.equal(query.userId, 'creator-user-id');
    return mockProfileDoc;
  });

  try {
    const result = await creatorAuthService.updateCreatorPlatforms('creator-user-id', ['instagram', 'youtube']);

    assert.deepEqual(result.platforms, ['instagram', 'youtube']);
    assert.equal(mockProfileDoc.saved, true);
  } finally {
    profileFindOneMock.mock.restore();
  }
});

test('updateCreatorPlatforms throws 404 when profile is not found', async () => {
  const profileFindOneMock = mock.method(CreatorProfile, 'findOne', async () => null);

  try {
    await assert.rejects(
      () => creatorAuthService.updateCreatorPlatforms('missing-user-id', ['instagram']),
      (error) => {
        assert.equal(error.statusCode, 404);
        assert.equal(error.code, 'CREATOR_PROFILE_NOT_FOUND');
        assert.equal(error.message, 'Creator profile not found');
        return true;
      }
    );
  } finally {
    profileFindOneMock.mock.restore();
  }
});

