# json sample post bodies

### `/submit-item-list`

```json
{
    "userId": "stang",
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

### BUILDING!!!! `/new-user`

```json
{
    "email":"tangs50@mcmaster.ca",
    "password":"password123",
    "firstName":"Sawyer",
    "lastName":"Tang"
}
```

### `/users/{userId}/add-location`

```json
{
    "name":"Home",
    "latitude": 40.7128,
    "longitude": -74.0060
}
```