const fs = require('fs');
const mongoose = require('mongoose');

async function updateDb() {
  const env = fs.readFileSync('.env.local', 'utf8');
  const uri = env.match(/MONGODB_URI=(.+)/)[1].trim();

  await mongoose.connect(uri);
  const settingsColl = mongoose.connection.collection('settings');
  const current = await settingsColl.findOne();

  if (current) {
    const updatedTheme = {
      ...current.seasonalTheme,
      enabled: true,
      theme: 'diwali',
      campaignStartDate: null,
      campaignEndDate: null,
      heroDesktopImage: '/uploads/campaigns/diwali/diwali-edit-banner.webp',
      heroMobileImage: '/uploads/campaigns/diwali/diwali-hero-mobile.webp',
      heroOfferText: 'FLAT 40% OFF',
    };

    if (Array.isArray(updatedTheme.campaignAssets)) {
      const mobileIdx = updatedTheme.campaignAssets.findIndex(
        (a) => a.id === 'diwali-hero-mobile'
      );
      const mobileAsset = {
        id: 'diwali-hero-mobile',
        purpose: 'Homepage Diwali Hero — Mobile Portrait',
        fileKey: 'campaigns/diwali/hero-mobile.webp',
        url: '/uploads/campaigns/diwali/diwali-hero-mobile.webp',
        width: 896,
        height: 1200,
        sizeBytes: 173182,
        format: 'image/webp',
        variant: 'mobile',
        active: true,
        createdAt: new Date().toISOString(),
      };
      if (mobileIdx > -1) {
        updatedTheme.campaignAssets[mobileIdx] = mobileAsset;
      } else {
        updatedTheme.campaignAssets.push(mobileAsset);
      }
    }

    const updateQuery = {};
    updateQuery['$set'] = { seasonalTheme: updatedTheme };
    await settingsColl.updateOne({ _id: current._id }, updateQuery);
    console.log('MongoDB settings updated successfully!');
  } else {
    console.log('No settings document found in DB.');
  }

  await mongoose.disconnect();
}

updateDb().catch(console.error);
