# Raise the Roof Landing Page

A secure, responsive landing page for roof inspections that donates $300-400 to Cheyenne schools per completed inspection.

## Features

- **Secure Website**: HTTPS enforcement, security headers, XSS protection
- **Responsive Design**: Mobile-first design that works on all devices
- **CTA Buttons**: Call, SMS, iMessage, Email, and HubSpot booking
- **HubSpot Integration**: Embedded meeting scheduler with custom form fields
- **Performance Optimized**: Fast loading with compression and caching
- **SEO Ready**: Meta tags and semantic HTML structure

## Setup Instructions

### 1. Domain Configuration
- Point `raisetheroofforeducation.com` to your hosting server
- Ensure SSL certificate is installed (Let's Encrypt recommended)

### 2. HubSpot Configuration

#### Update Contact Information
Replace placeholder values in `index.html`:
```html
<!-- Phone number -->
<a href="tel:+1-555-RTR-ROOF">📞 Call Now</a>

<!-- Email -->
<a href="mailto:info@raisetheroofforeducation.com">✉️ Email</a>
```

#### HubSpot Meeting Scheduler Setup
1. Create a HubSpot account and get your Portal ID
2. Set up a meeting scheduler
3. Update `script.js` with your actual HubSpot credentials:
   ```javascript
   const hubspotPortalId = 'YOUR_ACTUAL_PORTAL_ID';
   const meetingLink = 'YOUR_ACTUAL_MEETING_LINK';
   ```

#### Required Form Fields in HubSpot
Ensure your HubSpot form captures:
- Name (required)
- Phone (required)
- Email (optional but captured if provided)
- Address (required)
- School/Classroom (required)
- Access Notes (optional)

### 3. Twilio Configuration (for SMS/iMessage)
- Set up Twilio account
- Configure phone number for SMS
- Update phone numbers in HTML and JavaScript

### 4. Security Checklist
- [ ] HTTPS enabled
- [ ] Security headers configured (.htaccess)
- [ ] File permissions set (755 for directories, 644 for files)
- [ ] Sensitive files protected
- [ ] Regular backups configured

### 5. Customization Options

#### Donation Amount
Update the donation range in multiple places:
- Hero section
- How It Works section
- Trust section
- Footer

#### Branding
- Update colors in `styles.css`
- Replace hero image with your own
- Customize logo and branding

#### Content
- Update trust section with actual Interstate Roofing info
- Add school list when available
- Customize copy as needed

## File Structure
```
/
├── index.html          # Main landing page
├── styles.css          # CSS styles
├── script.js           # JavaScript functionality
├── .htaccess           # Security and server config
└── README.md           # This file
```

## Deployment

### Recommended Hosting
- **Shared Hosting**: Bluehost, SiteGround (with .htaccess support)
- **VPS/Cloud**: DigitalOcean, AWS EC2
- **Static Hosting**: Netlify, Vercel (may need serverless functions for forms)

### Performance Optimization
- Enable gzip compression
- Set up browser caching
- Use CDN for static assets (optional)
- Monitor Core Web Vitals

## Security Features

- **HTTPS Enforcement**: Automatic redirect to secure connection
- **Security Headers**: XSS protection, clickjacking prevention, MIME sniffing protection
- **Content Security Policy**: Restricts resource loading to trusted sources
- **Rate Limiting**: Basic protection against brute force attacks
- **Input Sanitization**: Client-side input validation and sanitization

## Testing Checklist

- [ ] All CTA buttons work (call, SMS, iMessage, email, booking)
- [ ] HubSpot form submits correctly
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] HTTPS certificate valid
- [ ] Security headers present
- [ ] Fast loading (< 3 seconds)
- [ ] Form validation works
- [ ] Donation amounts consistent ($300-400)

## Future Enhancements

- Password-protected AI Visualizer subpage
- Trust section with Interstate Roofing details
- School selection interface
- Donation tracking dashboard
- Analytics integration
- A/B testing framework

## Support

For technical issues or customization requests, check:
1. HubSpot documentation for scheduler setup
2. Twilio documentation for SMS configuration
3. Hosting provider documentation for SSL setup
