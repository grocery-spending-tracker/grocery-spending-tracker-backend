# grocery-spending-tracker-backend

## QuickStart

- install node

```bash
npm i
npm run start
```

# json sample post bodies

### `POST /users/new-user`

```json
{
    "first_name":"Sawyer",
    "last_name":"Tang",
    "email":"tangs50@mcmaster.ca",
    "password":"password123"
}
```
> note: encrypt password extra layer

### `GET /users/{userId}` \*\*
>requires `auth = <jwt_token>` in header

### `PATCH /users/{userId}` \*\*
>requires `auth = <jwt_token>` in header

```json
{
    
    "first_name":"Oscar",
    "last_name":"Williams",
    "birth_date":"2011-02-20",
    "home_base":{
        "longitude":40.712888,
        "latitude":-74.006000
    },
    "_____OptionalValues_____": "_____..._____"
}
```

### `DELETE /users/{userId}/delete-user` \*\*
>requires `auth = <jwt_token>` in header

### `POST /users/{userId}/submit-trip` \*\*
>requires `auth = <jwt_token>` in header

```json
{
    "date_time": "2024-01-21 14:30:00",
    "location": "1579 Main St W, Hamilton, ON L8S 1E6",
    "items": [
        {
            "item_desc": "ritz_crackers",
            "price": 3.99,
            "item_key": "134527354",
            "taxed": true
        },
        {
            "item_desc": "oreo",
            "price": 4.98,
            "item_key": "136764794",
            "taxed": true
        }
    ],
    "subtotal": 8.97,
    "total": 10.32,
    "trip_desc": "bought some junk at the store"
}
```

### `GET /users/my-trips` 
>requires `auth = <jwt_token>` in header

### `POST /auth/login`
```json
{
    "email":"uremail@mail.com",
    "password":"password123"
}
```
- Will return a token.

To get token, call `POST grocery-tracker.azurewebsites.net/auth/login` with body:
```json
{
    "user_id":6,
    "password":"mypassword"
}
```

To make a user-specific call, add the token to the header with key = "Auth"

<img width="945" alt="image" src="https://github.com/r-yeh/grocery-spending-tracker/assets/24414992/c65d12f2-f624-4a56-8496-e798398d741f">

