# Flashcardz webapp

This webapplication was part of an exam project of mine. It might not be in a 'finished' state, as many more features may be added.
As of right now, it works and you can use it (i.e. for learning for exams or practicing your memory skills).

 ---

## How to run?
1. `npm ci`
2. `npm start`

## Notes
- The expose-http Bash script sets up an SSH reverse tunnel using a temporary private SSH key and a random Unix domain socket name.
To use it you can fill in your own server's domain at `HOST=server_name` and fill in a temporary private key below `-----BEGIN OPENSSH PRIVATE KEY-----`.
You can then run it by typing `./expose-http` in the console.