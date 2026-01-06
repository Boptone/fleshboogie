# Fleshboogie TODO

## Newsletter Feature: "The Boogie Blast"

- [x] Resolve Home.tsx merge conflict from template upgrade
- [x] Design database schema for newsletter subscribers (email, timezone, preferences)
- [x] Build email subscription form component
- [ ] Create email template for The Boogie Blast (TABLED - requires email service API key)
- [ ] Implement content selection logic for daily digest (TABLED - requires email service API key)
- [ ] Build timezone-aware email scheduling system (TABLED - requires email service API key)
- [ ] Test email delivery (TABLED - requires email service API key)
- [x] Add unsubscribe functionality (database schema supports it)
- [x] Deploy and document newsletter subscription infrastructure

## Site Updates

- [x] Add hello@fleshboogie.com to footer

## Content Curation

- [x] Update RSS sources to focus on independent music and culture
- [x] Add filtering to exclude Top 40/mainstream pop and celebrity gossip

- [x] Add niche underground RSS sources (Tiny Mix Tapes, Gorilla vs. Bear, etc.)

## Admin Panel

- [x] Create /admin route and layout
- [x] Build content management forms (splash, main column, three columns)
- [x] Create backend API for saving content
- [x] Add authentication check (owner-only access)
- [x] Test admin panel functionality

## Bug Fixes

- [x] Replace all placeholder links with real article URLs
- [x] Audit entire site to ensure all links work correctly
- [x] Increase RSS feed update frequency from 1 hour to 15 minutes
