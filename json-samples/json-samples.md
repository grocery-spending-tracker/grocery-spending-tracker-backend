# json sample post bodies

### `POST /users/{userId}/submit-trip` \*\*

```json
{
    "userId": "400229786",
    "location": null,
    "date_time": null,
    "items": [
        {
            "name": "ritz_crackers",
            "price": 3.99,
            "quantity": 2,
            "itemID": "idk-what-this-will-be-1"
        },
        {
            "name": "oreo",
            "price": 4.98,
            "quantity": 1,
            "itemID": "idk-what-this-will-be-2"
        }
    ]

}
```

### `POST /users/new-user`

```json
{
    
    "first_name":"Sawyer",
    "last_name":"Tang",
    "email":"tangs50@mcmaster.ca",
    "password":"password123",
    "home_base":{
        "longitude":40.712888,
        "latitude":-74.006000
    }
}
```
> note: encrypt password extra layer

### `GET /users/{userId}` \*\*

### `PATCH /users/{userId}` \*\*
```json
{
    
    "first_name":"Oscar",
    "last_name":"Williams",
    "_____OptionalValues_____": "_____..._____"
}
```

### `DELETE /users/{userId}/delete-user` \*\*


### `POST /users/{userId}/add-location` \*\*

```json
{
    "name":"Home",
    "latitude": 40.7128,
    "longitude": -74.0060
}
```