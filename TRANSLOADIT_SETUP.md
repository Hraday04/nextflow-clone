# Transloadit Integration Setup

## Overview

Transloadit integration has been added to Image and Video nodes for:

- ☁️ **Cloud-based file processing**
- 🔄 **Automatic image optimization** (resize, compress, format conversion)
- 🎬 **Video encoding and thumbnail generation**
- 📦 **CDN delivery** for fast, global access
- 🔧 **Fallback to local processing** if Transloadit fails

## Setup Instructions

### 1. Create Transloadit Account

1. Go to [transloadit.com](https://transloadit.com)
2. Sign up for a free account (2GB processing per month)
3. Get your Auth Key and Secret from the account page

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_TRANSLOADIT_AUTH_KEY=your_auth_key_here
NEXT_PUBLIC_TRANSLOADIT_AUTH_SECRET=your_auth_secret_here
NEXT_PUBLIC_TRANSLOADIT_TEMPLATE_ID_IMAGE=your_image_template_id
NEXT_PUBLIC_TRANSLOADIT_TEMPLATE_ID_VIDEO=your_video_template_id
```

### 3. Create Templates (Optional)

Templates are pre-configured processing pipelines. You can:

- **Use inline steps** (current setup - works immediately)
- **Create templates** in Transloadit dashboard for reusability

#### Example Image Template:

```json
{
  "steps": {
    "import": {
      "robot": "/upload/handle"
    },
    "resize": {
      "robot": "/image/resize",
      "use": "import",
      "width": 800,
      "height": 600,
      "resize_strategy": "fit",
      "format": "jpg"
    },
    "optimize": {
      "robot": "/image/optimize",
      "use": "resize",
      "quality": 85
    }
  }
}
```

#### Example Video Template:

```json
{
  "steps": {
    "import": {
      "robot": "/upload/handle"
    },
    "encode": {
      "robot": "/video/encode",
      "use": "import",
      "preset": "mp4",
      "width": 1280,
      "height": 720,
      "resize_strategy": "fit"
    },
    "thumbnail": {
      "robot": "/video/thumbs",
      "use": "encode",
      "count": 1,
      "format": "jpg"
    }
  }
}
```

## Features

### Image Node

- **Upload modes**: Local vs Transloadit cloud processing
- **Processing**: Automatic resize, optimization, format conversion
- **Fallback**: Automatically switches to local upload if Transloadit fails
- **Progress**: Real-time upload progress with visual feedback

### Video Node

- **Upload modes**: Local vs Transloadit cloud processing
- **Processing**: Video encoding, compression, thumbnail generation
- **Formats**: Optimized MP4 output with consistent quality
- **CDN**: Global delivery via Transloadit's CDN

## Benefits

### Local Mode (Fallback)

- ✅ Works without internet/Transloadit account
- ✅ Instant uploads
- ❌ No optimization or CDN
- ❌ Large file sizes
- ❌ Browser compatibility issues

### Transloadit Mode

- ✅ Automatic optimization and compression
- ✅ CDN delivery for fast access
- ✅ Format conversion and compatibility
- ✅ Professional video encoding
- ❌ Requires internet and account
- ❌ Processing time (usually seconds)

## Testing

1. **Start the development server**:

   ```bash
   npm run dev
   ```

2. **Test without Transloadit** (will auto-fallback):
   - Add an Image or Video node
   - Toggle to "Local" mode
   - Upload a file - should work immediately

3. **Test with Transloadit** (after setup):
   - Configure `.env.local` with your credentials
   - Toggle to "Transloadit" mode
   - Upload a file - should show progress and optimize

## Troubleshooting

### Common Issues:

1. **"Upload failed" errors**: Check your Auth Key/Secret in `.env.local`
2. **Template errors**: Use inline steps (current setup) instead of template IDs
3. **CORS issues**: Transloadit automatically handles CORS for uploads
4. **Large files**: Free accounts have 2GB/month limit

### Debug Information:

- Check browser console for detailed error messages
- Upload progress is shown in the node UI
- Fallback reason is displayed if Transloadit fails

## Cost Estimation

- **Free tier**: 2GB processing/month
- **Paid plans**: Start at $19/month for 100GB
- **Pay-as-you-go**: Available for occasional use
- **Typical costs**:
  - Image optimization: ~0.5MB processing per 5MB image
  - Video encoding: ~1GB processing per 1GB video

## Next Steps

1. Set up your Transloadit account and credentials
2. Test with small files first
3. Monitor usage in Transloadit dashboard
4. Consider creating custom templates for specific workflows
5. Integrate with your CDN/storage solution if needed
