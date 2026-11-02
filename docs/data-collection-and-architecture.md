# FarmDirect: Data Collection and Architecture

## 1. Data Collection

FarmDirect collects the information required to support direct farmer-to-consumer commerce and product traceability.

- **Product data:** product name, category, description, price, unit, quantity, availability, image, and farmer association.
- **Farmer data:** name, contact details, farm profile, location, description, and verification status.
- **Consumer data:** account details, contact information, and delivery preferences required to fulfil orders.
- **Order data:** consumer, ordered products, quantities, unit prices, totals, delivery address, payment method, and order status.
- **Traceability data:** harvest date, packing date, expiry date, product origin, batch number, and ingredient information.
- **Smart agriculture inputs:** soil type selected by the user and the crop suggestions shown by the soil-to-seed feature.
- **Voice and language interactions:** speech is processed by browser speech recognition when supported. The interface language selected by the user controls the feature labels and spoken guidance.

Collect only data needed for the stated application purpose. Do not store raw voice recordings as part of the current voice-search feature.

## 2. Application Architecture

1. **Presentation layer:** React and Vite provide the web interface for consumers and farmers.
2. **Routing and state:** React Router manages page navigation; existing application context manages authentication and shopping state.
3. **API layer:** the frontend calls REST endpoints exposed by the Node.js and Express backend.
4. **Business logic:** backend services validate requests, apply access rules, and coordinate database operations.
5. **Data access:** Prisma ORM maps application models to PostgreSQL tables.
6. **Database:** PostgreSQL stores accounts, farmer and consumer profiles, products, orders, favourites, and traceability records.
7. **Authentication:** JWT protects authenticated routes; passwords are hashed with bcrypt.
8. **Smart features:** browser speech recognition supports voice search; browser speech synthesis reads product guidance aloud; the soil-to-seed module provides general rule-based crop examples.

## 3. High-Level Data Flow

```text
Consumer / Farmer
       |
       v
React + Vite interface
       |
       v
REST API (Node.js + Express)
       |
       v
Validation and application services
       |
       v
Prisma ORM
       |
       v
PostgreSQL database
```

Voice search and spoken product guidance use browser capabilities. Soil-to-seed recommendations are rule-based examples displayed by the frontend and should be confirmed against local soil testing, climate, water availability, and advice from an agricultural professional.

## 4. Security and Privacy

- Keep database URLs, JWT secrets, and provider keys in environment variables; do not commit real secrets.
- Hash passwords before storing them.
- Apply role-based authorization to farmer and consumer operations.
- Validate API inputs and return only the fields required by the client.
- Avoid collecting or retaining voice recordings unless a future feature has a clear need and appropriate user consent.

## 5. Current Scope and Limitations

The multilingual interface provides English, Tamil, and Hindi labels for the Farm Tools page. Voice recognition availability and language accuracy depend on the browser and operating system. Crop suggestions are general educational guidance, not a replacement for laboratory soil analysis or locally validated agronomic advice.
