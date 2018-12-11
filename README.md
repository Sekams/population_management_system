# The Population Management System

**The Population Management System** is a RESTful API for serving data persistence methods to The Population Management application.

## Getting Started
To be able to use the application locally, one should follow the guidelines highlighted below.

1. Clone/download the application Github repository by running the command below in a git shell
```
git clone https://github.com/Sekams/population_management_system.git
```
2. Navigate (cd) to a application root directory and install NPM, Yarn and Node.js via the terminal (guides [here](https://docs.npmjs.com/getting-started/installing-node) and [here](https://yarnpkg.com/lang/en/docs/install).)
 
3. Install the application requirements by running the code below in the terminal at the application root directory:
```
yarn install
```

4. Install MongoDB (guide [here](https://docs.mongodb.com/manual/installation/))

5. Create a Mongo Database and add take note of its name to be used in the next step. Run the command below in a fresh terminal instance to start MongoDB
```
mongod
```

6. Set up the environment variables in a file named `.env` at the application root directory and follow the structure in the `.env.example` file.

7. After all the requirements are installed on the local application instance, run the application by running the following code in the terminal at the application root directory:
```
yarn start
```
8. After successfully running the application, one can explore the features of The Population Management System by accessing: `http://localhost:<PORT>` (replace `<PORT>` with port number) in any client of choice

## Features
* User Account management (Signup, Signin, Authentication and Removal)
* Place creation, editing and deletion
* Place nesting

## EndPoints

| Type | API EndPoint | Requires Token | Description |
| --- | --- | --- | --- |
| POST | /api/v1/users/signup | NO | Registers a user and requires **firstName**, **lastName**, **username** and **password** as string arguments<br/><br/>**Sample Payload**<br/><pre>{<br/>&nbsp;&nbsp;"firstName": "Chris",<br/>&nbsp;&nbsp;"lastName": "Griffin",<br/>&nbsp;&nbsp;"username": "chrisy",<br/>&nbsp;&nbsp;"password": "12345"<br/>}</pre><br/> **Sample Response**<br/><pre>{<br/>&nbsp;&nbsp;"message": "Signup successful",<br/>&nbsp;&nbsp;"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjMGEzYjM5MmEzZTViMTkxNjlkMmMwYSIsImlhdCI6MTU0NDE3NDM5MywiZXhwIjoxNTQ0MjYwNzkzfQ.MTfUZcZks7uXrGCkJyBJLG2hWqK2KYElU7qEvBSk4eA"<br/>}</pre> |
| POST | /api/v1/users/signin | NO | Logs regitered users in and requires **username** and **password** as string arguments<br/><br/>**Sample Payload**<br/><pre>{<br/>&nbsp;&nbsp;"username": "chrisy",<br/>&nbsp;&nbsp;"password": "12345"<br/>}</pre><br/> **Sample Response**<br/><pre>{<br/>&nbsp;&nbsp;"message": "Signin successful",<br/>&nbsp;&nbsp;"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjMGEzYjM5MmEzZTViMTkxNjlkMmMwYSIsImlhdCI6MTU0NDE3NDM5MywiZXhwIjoxNTQ0MjYwNzkzfQ.MTfUZcZks7uXrGCkJyBJLG2hWqK2KYElU7qEvBSk4eA"<br/>}</pre> |
| DELETE | /api/v1/users/\<userId\> | YES | Deletes a particular user with the id **userId** and edits all the places with their id<br/><br/> **Sample Response**<br/><pre>{<br/>&nbsp;&nbsp;"message": "User was deleted",<br/>&nbsp;&nbsp;"updatedPlaceCreations": {<br/>&nbsp;&nbsp;&nbsp;&nbsp;"n": 1,<br/>&nbsp;&nbsp;&nbsp;&nbsp;"nModified": 1,<br/>&nbsp;&nbsp;&nbsp;&nbsp;"ok": 1<br/>&nbsp;&nbsp;}, <br/>&nbsp;&nbsp;"updatedPlaceUpdates": {<br/>&nbsp;&nbsp;&nbsp;&nbsp;"n": 1,<br/>&nbsp;&nbsp;&nbsp;&nbsp;"nModified": 1,<br/>&nbsp;&nbsp;&nbsp;&nbsp;"ok": 1<br/>&nbsp;&nbsp;}<br/>}</pre> |
| POST | /api/v1/places | YES | Creates a new place and requires **male**, **female** as number arguments and **name** as a string argument. **parentPlaceId** is an optional string argument<br/><br/>**Sample Payload**<br/><pre>{<br/>&nbsp;&nbsp;"male": 9,<br/>&nbsp;&nbsp;"female": 20,<br/>&nbsp;&nbsp;"name": "Kitimbojjo",<br/>&nbsp;&nbsp;"parentPlaceId": "5c0d30fb74f65d5c705371bb"<br/>}</pre><br/> **Sample Response**<br/><pre>{<br/>&nbsp;&nbsp;"message": "Place created successfully",<br/>&nbsp;&nbsp;"data": {<br/>&nbsp;&nbsp;&nbsp;&nbsp;"_id": "5c0a45ad2a3e5b19169d2c0b",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"male": 9,<br/>&nbsp;&nbsp;&nbsp;&nbsp;"female": 20,<br/>&nbsp;&nbsp;&nbsp;&nbsp;"name": "Kitimbojjo",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"parentPlaceId": "5c0d30fb74f65d5c705371bb",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"createdBy": "5c0e7edafad81b1e97105947",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"updatedBy": "5c0e7edafad81b1e97105947",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"total": 29,<br/>&nbsp;&nbsp;&nbsp;&nbsp;"createdAt": "2018-12-07T10:04:29.261Z",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"updatedAt": "2018-12-07T10:04:29.261Z",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"__v": 0<br/>&nbsp;&nbsp;},<br/>&nbsp;&nbsp;"parentUpdateResult": {<br/>&nbsp;&nbsp;&nbsp;&nbsp;"_id": "5c0d30fb74f65d5c705371bb",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"male": 118,<br/>&nbsp;&nbsp;&nbsp;&nbsp;"female": 190,<br/>&nbsp;&nbsp;&nbsp;&nbsp;"name": "Kiboga",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"createdBy": "Deleted",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"updatedBy": "5c0e7edafad81b1e97105947",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"createdAt": "2018-12-07T10:04:29.261Z",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"updatedAt": "2018-12-07T10:04:29.261Z",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"__v": 0,<br/>&nbsp;&nbsp;&nbsp;&nbsp;"total": 308,<br/>&nbsp;&nbsp;}<br/>}</pre> |
| GET | /api/v1/places | YES | Retrieves all available places<br/><br/> **Sample Response**<br/><pre>{<br/>&nbsp;&nbsp;"message": "Places fetched successfully",<br/>&nbsp;&nbsp;"data": [<br/>&nbsp;&nbsp;&nbsp;&nbsp;{<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id": "5c0e851bfad81b1e97105949",<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"male": 9,<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"female": 20,<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name": "Kitimbojjo",<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"parentPlaceId": "5c0d30fb74f65d5c705371bb",<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"createdBy": "5c0e7edafad81b1e97105947",<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"updatedBy": "5c0e7edafad81b1e97105947",<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"total": 29,<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"createdAt": "2018-12-07T10:04:29.261Z",<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"updatedAt": "2018-12-07T10:04:29.261Z",<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"__v": 0<br/>&nbsp;&nbsp;&nbsp;&nbsp;},<br/>&nbsp;&nbsp;&nbsp;&nbsp;{<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id": "5c0d30fb74f65d5c705371bb",<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"male": 118,<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"female": 190,<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name": "Kiboga",<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"createdBy": "Deleted",<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"updatedBy": "5c0e7edafad81b1e97105947",<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"createdAt": "2018-12-07T08:23:45.260Z",<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"updatedAt": "2018-12-07T08:23:45.260Z",<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"__v": 0,<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"total": 308<br/>&nbsp;&nbsp;&nbsp;&nbsp;}<br/>&nbsp;&nbsp;]<br/>}</pre> |
| GET | /api/v1/places/\<placeId\> | YES | Retrives a particular place with the id **placeId**<br/><br/> **Sample Response**<br/><pre>{<br/>&nbsp;&nbsp;"message": "Place fetched successfully",<br/>&nbsp;&nbsp;"data": {<br/>&nbsp;&nbsp;&nbsp;&nbsp;"_id": "5c0e851bfad81b1e97105949",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"male": 9,<br/>&nbsp;&nbsp;&nbsp;&nbsp;"female": 20,<br/>&nbsp;&nbsp;&nbsp;&nbsp;"name": "Kitimbojjo",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"parentPlaceId": "5c0d30fb74f65d5c705371bb",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"createdBy": "5c0e7edafad81b1e97105947",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"updatedBy": "5c0e7edafad81b1e97105947",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"total": 29,<br/>&nbsp;&nbsp;&nbsp;&nbsp;"createdAt": "2018-12-07T10:04:29.261Z",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"updatedAt": "2018-12-07T10:04:29.261Z",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"__v": 0<br/>&nbsp;&nbsp;}<br/>}</pre> |
| PUT | /api/v1/places/\<placeId\> | YES | Updates a particular place with the id **placeId** and takes either **male**, **female**, **name**, **parentPlaceId** or all as arguments<br/><br/>**Sample Payload**<br/><pre>{<br/>&nbsp;&nbsp;"name": "Lubya"<br/>}</pre><br/> **Sample Response**<br/><pre>{<br/>&nbsp;&nbsp;"message": "Place created successfully",<br/>&nbsp;&nbsp;"data": {<br/>&nbsp;&nbsp;&nbsp;&nbsp;"_id": "5c0a45ad2a3e5b19169d2c0b",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"male": 9,<br/>&nbsp;&nbsp;&nbsp;&nbsp;"female": 20,<br/>&nbsp;&nbsp;&nbsp;&nbsp;"name": "Lubya",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"parentPlaceId": "5c0d30fb74f65d5c705371bb",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"createdBy": "5c0e7edafad81b1e97105947",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"updatedBy": "5c0e7edafad81b1e97105947",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"total": 29,<br/>&nbsp;&nbsp;&nbsp;&nbsp;"createdAt": "2018-12-07T10:04:29.261Z",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"updatedAt": "2018-12-07T10:04:29.261Z",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"__v": 0<br/>&nbsp;&nbsp;},<br/>&nbsp;&nbsp;"parentUpdateResult": {<br/>&nbsp;&nbsp;&nbsp;&nbsp;"_id": "5c0d30fb74f65d5c705371bb",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"male": 127,<br/>&nbsp;&nbsp;&nbsp;&nbsp;"female": 210,<br/>&nbsp;&nbsp;&nbsp;&nbsp;"name": "Kiboga",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"createdBy": "Deleted",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"updatedBy": "5c0e7edafad81b1e97105947",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"createdAt": "2018-12-07T10:04:29.261Z",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"updatedAt": "2018-12-07T10:04:29.261Z",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"__v": 0,<br/>&nbsp;&nbsp;&nbsp;&nbsp;"total": 337,<br/>&nbsp;&nbsp;}<br/>}</pre> |
| DELETE | /api/v1/places/\<placeId\> | YES | Deletes a particular place with the id **placeId**<br/><br/>**Sample Response**<br/><pre>{<br/>&nbsp;&nbsp;"message": "Place was deleted",<br/>&nbsp;&nbsp;"updatedPlace": {<br/>&nbsp;&nbsp;&nbsp;&nbsp;"n": 0,<br/>&nbsp;&nbsp;&nbsp;&nbsp;"nModified": 0,<br/>&nbsp;&nbsp;&nbsp;&nbsp;"ok": 1<br/>&nbsp;&nbsp;}<br/>}</pre> |


## Testing
The application's tests can be executed by running the code below within the terminal at the application root directory:
```
yarn test
```