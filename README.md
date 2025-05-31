
# Property Listing System

A backend application built with TypeScript and Node.js for managing property listings.

## Features

- Add, update, view, and delete property listings
- Retrieve property details
- Search and filter properties
- Recommend and Favorite Properties
- Caching using Redis
- Authentication using JWT
- Secured Routes
- RESTful API endpoints
- Data validation and error handling
## Tech Stack

- Node.js
- TypeScript
- Express.js
- MongoDB
- Redis
## Installation

*Prerequisites*
- Node.js and npm installed
- MongoDB instance running

**Installation**

- Clone the Repo 

```bash
  git clone https://github.com/AbhimanyuPratapSingh1803Property-Listing-System.git
  cd Property-Listing-System
```
- Install dependencies
```bash
  npm install
```
- Configure environment variables
  Create a .env file and add necessary configurations (e.g.,      MongoDB URI).

- Start the development server
```bash
  npm run dev
```
## API Reference

#### Get Filtered Property List

```http
  GET /property/getProperties
```

| Method | Endpoint        | Description           |
| ------ | --------------- | --------------------- |
| GET    | /properties     | Get all properties    |
| GET    | /property/getProperties?furnished=Furnished | Get  filtered property list   |

- *Properties can be filtered based on all the 16 given parameters*


#### User Authentication

```http
  POST /user
```

| Method | Endpoint        | Description           |
| ------ | --------------- | --------------------- |
| POST   | /register     | Register user using Name, Email, Password and Role |
| POST    | /login | Login using Email and Password |
| POST | /logout | Logout user |

#### CRUD Operations on Properties

```http
  POST /user
```

| Method | Endpoint        | Description           |
| ------ | --------------- | --------------------- |
| POST   | /add     | Create a new property |
| PUT    | /update/:propertyId | Update property by ID |
| POST | /delete/:propertyId | Delete property by ID |

- *CRUD operations on properties can be performed only by the users having their role same as the listedBy field of the property*

#### Recommendations and Favorites

```http
  POST /user
```

| Method | Endpoint        | Description           |
| ------ | --------------- | --------------------- |
| POST   | /addFavorite/:propertyId     | Add property to Favorites |
| POST    | /getFavorites | get Favorite properties |
| POST | /removeFavorite/:propertyId | Delete property from Favorites |
