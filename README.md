# 272-project

The **YOLO-LMS** powers the Next-Gen Learning Management System, providing a scalable and modular API layer using **Node.js**, **Express**, and **DynamoDB** (via Dynamoose). Authentication and authorization are handled through **Clerk**.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/gclarence011/YOLO-LMS.git
cd YOLO-LMS
```

## Running in Docker

### 1. Configure Environment Variables

Create a `.env` file in the root of the project directory (or edit the `.env.example` file and rename it):

```env
NODE_ENV=development

# Clerk info
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Backend port
NEXT_PUBLIC_API_BASE_URL=http://server:8002
DYNAMODB_LOCAL_URL=http://dynamodb-local:8000

# AWS DynamoDB 
AWS_ACCESS_KEY_ID=dummy
AWS_SECRET_ACCESS_KEY=dummy
AWS_REGION=us-west-2
```

> 🔐 Replace values with your actual Clerk API keys. You can find them in the [Clerk dashboard](https://dashboard.clerk.com/).

### 2. Configure AWS for DynamoDB in Docker

You will need to have AWS CLI for this. We need to make sure the AWS Credential matches the on in the .env file

```bash
aws configure

```
For Example:
```bash
WS Access Key ID [***************ummy: dummy
AWS Secret Access Key [****************ummy]: dummy
Default region name [us-west-2]: us-west-2
Default output format [None]: 
```

### 3. Start Docker and run compose

> Ensure Docker is installed and running before using this command.

```bash
docker-compose up
```

This will:
* Run the client(frontend) on `http://localhost:3000`
* Run the server(backend) on `http://server:8002`
* Run the DynamoDB on `http://dynamodb-local:8000`
* Run the DynamoDB Admin (web ui for DB) on `http:localhost:8001`

> Access the DB web ui at [http:localhost:8001](http:localhost:8001)

> Access the client at [http:localhost:3000](http:localhost:3000)

> Set your role at [http:localhost:3000/admin](http:localhost:3000/admin)

---

## Running Local

###  Client

### 1. Install Dependencies

```bash
cd client
npm install
```

### 2. Configure Environment Variables (or edit the `.env.example` file and rename it):

Create a `.env.local` file in the root of the clent directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8002
NEXT_PUBLIC_LOCAL_URL=http://localhost:3000

CLERK_PUBLISHABLE_KEY=your-clerk-puplishable-key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-puplishable-key
CLERK_SECRET_KEY=your-clerk-secret-key
```

> 🔐 Replace values with your actual Clerk API keys. You can find them in the [Clerk dashboard](https://dashboard.clerk.com/).

### 3. Run the Client

```bash
npm run dev
```

The client will run on `http://localhost:3000`
> Access the client at [http:localhost:3000](http:localhost:3000)

> Set your role at [http:localhost:3000/admin](http:localhost:3000/admin)



---
### Server 

### 1. Install Dependencies

```bash
cd ../server
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root of the backend directory (or edit the `.env.example` file and rename it):

```env
PORT=8002
NODE_ENV=development
DynamoDB_LOCAL_URL=http://localhost:3000

CLERK_PUBLISHABLE_KEY=your-clerk-puplishable-key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-puplishable-key
CLERK_SECRET_KEY=your-clerk-secret-key

AWS_ACCESS_KEY_ID=dummy
AWS_SECRET_ACCESS_KEY=dummy
AWS_REGION=us-west-2
```

> 🔐 Replace values with your actual Clerk API keys. You can find them in the [Clerk dashboard](https://dashboard.clerk.com/).

### 3. Run the Server

```bash
npm run dev
```

The server will run on `http://localhost:8002`

---


### 🧪 Running Local DynamoDB with Docker

This backend uses DynamoDB (via Dynamoose). To run DynamoDB locally:
> Ensure Docker is installed and running before using this command.

### 1. Navigate to the `deployment` folder

```bash
cd deployment
```

### 2. Start DynamoDB Local with Docker Compose

```bash
docker-compose up
```

This will:

* Pull the `amazon/dynamodb-local` image
* Run it on port `8000`
* Mount the local data volume at `./docker/dynamodb`


> Access the DB web ui at [http:localhost:8001](http:localhost:8001)
---

## 📌 Key Technologies
* **Node.js** / **Express** – backend framework
* **Dynamoose** – DynamoDB modeling
* **Clerk** – Authentication & authorization
* **Docker Compose** – Local DB environment

---

## 📬 Feedback or Issues?

Feel free to open an issue or submit a pull request. Contributions are welcome!
