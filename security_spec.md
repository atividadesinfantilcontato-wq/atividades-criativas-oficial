# Firestore Security Specification & TDD Plan

This document details the security design, data invariants, and defensive validation payloads ("The Dirty Dozen") for the Atividades Criativas database.

## 1. Data Invariants

1. **Authentication Boundary**: Unauthenticated users can only READ products, reviews, and the site configuration. Only authenticated administrators can write (create, update, delete) to any collection.
2. **Product Schema Integrity**: Product documents must contain correct data types (e.g. `price` must be a positive number, `pages` a positive integer, strings must have strict length boundaries).
3. **Admin Exclusivity**: There are no default custom claims. Admin status is strictly validated by checking if the user's `uid` exists in the `/admins/$(request.auth.uid)` collection, or if the user matches the bootstrapped administrator email.
4. **No Direct User Profile Write**: Standard visitors cannot elevate their privileges.

---

## 2. The "Dirty Dozen" Malicious Payloads (Negative Tests)

The following 12 payloads are designed to attack the database's Identity, Integrity, or State. All of these must be rejected with `PERMISSION_DENIED` by our rules.

### Case 1: Unauthenticated Product Creation
*   **Target**: `/products/malicious_item`
*   **Payload**: `{"id": "malicious_item", "name": "Fake PDF", "price": 10.0}`
*   **Auth**: Unauthenticated (`request.auth == null`)
*   **Expected Result**: `PERMISSION_DENIED`

### Case 2: Spoofed Author/Admin ID in Reviews
*   **Target**: `/reviews/attacker_review`
*   **Payload**: `{"id": "attacker_review", "name": "Fake Name", "stars": 5, "verified": true}`
*   **Auth**: Authenticated user trying to create a review claiming to be "verified" or "admin" without verification credentials
*   **Expected Result**: `PERMISSION_DENIED` (Unless authenticated as real Admin)

### Case 3: Shadow field injection in Product update (Shadow Update Test)
*   **Target**: `/products/some_product`
*   **Payload**: `{"isVerifiedAdminProduct": true}` (Updating non-existent property)
*   **Auth**: Standard User
*   **Expected Result**: `PERMISSION_DENIED`

### Case 4: Price Spoofing / Re-pricing Attack
*   **Target**: `/products/valuable_pdf`
*   **Payload**: `{"price": -5.00}` (Setting price to negative value)
*   **Auth**: Standard User/Attacker
*   **Expected Result**: `PERMISSION_DENIED`

### Case 5: Denial of Wallet via Giant ID (ID Poisoning Guard)
*   **Target**: `/products/` + a 50KB long alphanumeric string
*   **Payload**: `{"id": "giant...", "name": "PDF"}`
*   **Auth**: Standard User/Attacker
*   **Expected Result**: `PERMISSION_DENIED` (Document ID size limit exceeded)

### Case 6: Attempting to modify read-only properties (Immutable Field Rule)
*   **Target**: `/products/some_product`
*   **Payload**: `{"createdAt": "2030-01-01"}` (Modifying creation timestamp)
*   **Auth**: Standard User
*   **Expected Result**: `PERMISSION_DENIED`

### Case 7: Email Spoofing Attack on Site Configuration
*   **Target**: `/siteConfig/global`
*   **Payload**: `{"promoText": "Hacked promo"}`
*   **Auth**: User claiming admin email but `email_verified == false`
*   **Expected Result**: `PERMISSION_DENIED`

### Case 8: Attempting to delete critical Site Configuration
*   **Target**: `/siteConfig/global`
*   **Payload**: `{}` (Request to delete document)
*   **Auth**: Anyone
*   **Expected Result**: `PERMISSION_DENIED`

### Case 9: Giant String Injection in Reviews (Valuation Poisoning)
*   **Target**: `/reviews/some_review`
*   **Payload**: `{"comment": "a..."}` (a 2MB long string)
*   **Auth**: Anyone
*   **Expected Result**: `PERMISSION_DENIED`

### Case 10: Anonymous Writing to Products
*   **Target**: `/products/any`
*   **Payload**: `{"name": "Anonymous"}`
*   **Auth**: Anonymous or unverified user
*   **Expected Result**: `PERMISSION_DENIED`

### Case 11: Tampering with Database System Fields
*   **Target**: `/products/prod_1`
*   **Payload**: `{"systemMetadata": "hacked"}`
*   **Auth**: Standard Client
*   **Expected Result**: `PERMISSION_DENIED`

### Case 12: Orphaned Review Creation without valid Product
*   **Target**: `/reviews/review_1`
*   **Payload**: `{"productName": "Non-existent Product", "verified": true}`
*   **Auth**: Unverified user
*   **Expected Result**: `PERMISSION_DENIED`

---

## 3. The Test Runner Structure
The firestore rules will be tested against the above payloads. All requests must strictly require verified administrative identity for mutations.
