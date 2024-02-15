# grocery-spending-tracker-backend

## QuickStart

- install node 20

```bash
npm i
npm run start
```
- generate rsa keys

```bash
openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -pubout -in private_key.pem -out public_key.pem
```

- make `.env` file to your local enviroment

```bash
AZURE_POSTGRESQL_USER=<db user>
AZURE_POSTGRESQL_HOST=<db host>
AZURE_POSTGRESQL_DATABASE=<db name>
AZURE_POSTGRESQL_PASSWORD=<db password>
AZURE_POSTGRESQL_PORT=<db port>
AZURE_POSTGRESQL_SSL=false
```

# Test and Coverage

```bash
npm test # run unit tests
npm run coverage # run tests with coverage report
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

### `POST /users/trip` \*\*
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

### `GET /users/trip` 
>requires `auth = <jwt_token>` in header

### `POST /users/goal`
>requires `auth = <jwt_token>` in header
```json
{
	"start_date": "2023-01-21",
	"end_date": "2024-01-21",
	"budget": 100.00
}
```

### `GET /users/goal`
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

