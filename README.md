# Socket.io Sample. Simple Chat

This project is intended to explain and teach the use of express and socket.io in a basic level

## Dependencies

If you don't want to install anything else you can use docker only.

To run localy without docker use:

- NodeJs
- ExpressJs
- Jest
- SQLlite

## Run

Its better to run it with docker as follows.

Make sure that the terminal is running in the same directory as this file and run

```bash
docker build -t socket-qserver . && docker run -it -p 3000:3000 socket-qserver:latest
````

Otherwise you can run ```node index.js```
