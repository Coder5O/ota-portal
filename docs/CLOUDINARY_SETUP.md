# Cloudinary media uploads

The public website's news, gallery, and image fields upload to Cloudinary when
both values below are configured. They are intentionally public browser
configuration values; do not add a Cloudinary API secret to this project.

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=ota_portal_unsigned
```

## One-time Cloudinary configuration

1. Create a free Cloudinary account and open **Settings → Upload → Upload presets**.
2. Create a preset named `ota_portal_unsigned` (or choose another name) and set its signing mode to **Unsigned**.
3. In the preset, restrict formats to the image and video types you plan to publish, limit file size to 100 MB, and set the asset folder to `ota-governance`.
4. Add the cloud name and preset name to `.env.local` for local development and to your hosting provider's environment settings for production.
5. Restart the development server or redeploy after changing environment values.

The preset name is visible to browsers. The public site limits access to its
upload controls to administrators, while the preset restrictions provide an
additional guardrail against misuse. Rotate the preset if you suspect it has
been abused.
