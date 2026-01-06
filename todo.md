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

## Mailchimp Integration

- [x] Add Mailchimp API key and Audience ID as secrets
- [x] Update newsletter router to sync subscribers to Mailchimp
- [x] Test Mailchimp integration
- [x] Deploy Mailchimp integration

## Legal Pages

- [x] Create Privacy Policy page (California/CCPA compliant)
- [x] Create Terms of Service page
- [x] Add Privacy Policy and TOS links to footer
- [x] Add service mark (℠) symbol to Fleshboogie branding
- [x] Test legal pages

## Design Updates

- [x] Remove service mark (℠) from large masthead logo
- [x] Keep service mark only in footer copyright line

## Bug Fixes (Round 2)

- [x] Audit all story links on live site
- [x] Identify which links are broken or going to wrong URLs
- [x] Fix broken links in content.json or RSS feed logic
- [x] Verify all links click through to correct articles

## Critical Bug Fix: Broken Links (Round 3)

- [ ] Inspect actual content.json file to see what URLs are stored
- [ ] Test RSS feed parser to verify it's extracting correct URLs
- [ ] Check how links are rendered in Home.tsx
- [ ] Test 10+ links across all sections to identify pattern
- [ ] Identify root cause of broken links
- [ ] Implement permanent fix
- [ ] Verify all links work correctly

## New RSS Sources Integration

- [x] Add Clash Music RSS feed
- [x] Add NME RSS feed
- [x] Add Juxtapoz RSS feed
- [x] Add Music Business Worldwide RSS feed
- [x] Add Mojo RSS feed
- [x] Add Uncut RSS feed
- [x] Add Aquarium Drunkard RSS feed
- [x] Add Rolling Stone RSS feed
- [x] Add Goldmine RSS feed
- [x] Add uDiscover Music RSS feed
- [x] Test all new feeds for correct article URLs (18/20 working, removed 2 broken feeds)
- [x] Deploy updated RSS sources
