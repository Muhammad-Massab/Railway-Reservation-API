# 🚆 Railway Ticket Reservation API

A RESTful API for managing railway ticket reservations, implementing business logic for confirmed berths, RAC (Reservation Against Cancellation), and a waiting list. The system supports seat allocation based on age and gender, cancellation promotion logic, and concurrency handling.

---

## Features

- Book a Ticket
- Cancel a Ticket
- View Booked Tickets
- View Available Tickets
- Store children under 5 without assigning berths
- Proper berth allocation priority
- Promotion: RAC → Confirmed, Waiting → RAC
- RESTful API with validations and error handling
- Dockerized deployment

---

## Tech Stack

- **Language**: Node.js
- **Database**: PostgreSQL
- **Containerization**: Docker & Docker Compose

---

## Local Setup (Without Docker)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/railway-ticket-reservation.git
cd railway-ticket-reservation
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the application

```bash
npm run dev
```

## Docker Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/railway-ticket-reservation.git
cd railway-ticket-reservation
```

### 2. Build and start the containers

```bash
docker-compose up --build
```
