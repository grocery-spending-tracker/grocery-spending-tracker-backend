# json sample post bodies

### `POST /users/{userId}/submit-trip` \*\*

```json
{
    "userId": "400229786",
    "location": null,
    "dateTime": null,
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

### `POST /users/new-user` \*\*

```json
{
    "email":"tangs50@mcmaster.ca",
    "password":"password123",
    "firstName":"Sawyer",
    "lastName":"Tang"
}
```
> note: encrypt password extra layer

### `POST /users/{userId}/get-user` \*\*

### `POST /users/{userId}/update-user` \*\*

### `POST /users/{userId}/delete-user` \*\*


### `POST /users/{userId}/add-location` \*\*

```json
{
    "name":"Home",
    "latitude": 40.7128,
    "longitude": -74.0060
}
```