# Frontend App

This is the storefront frontend for the outdoor-gear demo. This repository contains the code for PR #456 feature branch.

## Branch: feature/pr-456

This branch adds the Peak Club loyalty rewards experience to the storefront preview.

## Features

- Gear catalog with add-to-cart and remove-from-cart management
- Peak Club enrollment with a 500-point welcome bonus
- Point earning on every cart add and point redemption at checkout
- GOLD15 promo code with a 15% discount
- Free-shipping progress meter with an $80 threshold

## Deployment

This application is deployed as a preview environment for PR #456 testing.

### Preview Environment Details

- PR Number: 456
- Branch: feature/pr-456
- Environment: Preview
- Namespace: pr-preview-456

## Build

This is a static HTML application that can be served by any web server (nginx, apache, etc.)

## PR Changes

- Loyalty panel with enrollment and live points balance
- Redemption and promo tooling inside the cart summary
- Updated order summary rows for the loyalty rollout
