# json sample post bodies

### `POST /users/new-user`

```json
{
    
    "first_name":"Sawyer",
    "last_name":"Tang",
    "email":"tangs50@mcmaster.ca",
    "password":"password123",
    "birth_date":"2011-02-20",
    "home_base":{
        "longitude":40.712888,
        "latitude":-74.006000
    }
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
            "taxed": true
        },
        {
            "item_desc": "oreo",
            "price": 4.98,
            "taxed": true
        }
    ],
    "subtotal": 8.97,
    "total": 10.32,
    "trip_desc": "bought some junk at the store"

}
```

### `POST /auth/login`
```json
{
    "user_id":1,
    "password":"password123"
}
```
- Will return a token.
- Apply this token to all subsequent userspecific calls in the header with key 'auth'
