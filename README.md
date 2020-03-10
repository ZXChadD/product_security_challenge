# Instructions

The application can be found at https://zdtestapp.herokuapp.com/

1. [x] Input sanitization and validation
- Done on both frontend and backend         
2. [x] Password hashed
- Used bcrpt and salt
3. [x] Prevention of timing attacks
- Rate limiting
4. [x] Logging
- Logged all Http requests using winston package
5. [x] CSRF prevention
- Used csrf token to verify request 
6. [] Multi factor authentication
7. [x] Password reset / forget password mechanism
- Password reset link will be sent through email
8. [x] Account lockout
- After a few unsucessful tries, the user's account will be locked for 20mins
9. [x] Cookie 
- Used of JWT authentication token
10. [x] HTTPS
11. [x] Known password check
- User's password will be checked against a list of known passwords

# Zendesk Product Security
### The Zendesk Product Security Challenge

Hello friend,

We are super excited that you want to be part of the Product Security team at Zendesk.

**To get started, you need to fork this repository to your own Github profile and work off that copy.**

In this repository, there are the following files:
1. README.md - this file
2. project/ - the folder containing all the files that you require to get started
3. project/index.html - the main HTML file containing the login form
4. project/assets/ - the folder containing supporting assets such as images, JavaScript files, Cascading Style Sheets, etc. You shouldn’t need to make any changes to these but you are free to do so if you feel it might help your submission

As part of the challenge, you need to implement an authentication mechanism with as many of the following features as possible. It is a non exhaustive list, so feel free to add or remove any of it as deemed necessary.

1. Input sanitization and validation
2. Password hashed
3. Prevention of timing attacks
4. Logging
5. CSRF prevention
6. Multi factor authentication
7. Password reset / forget password mechanism
8. Account lockout
9. Cookie
10. HTTPS
11. Known password check

You will have to create a simple binary (platform of your choice) to provide any server side functionality you may require. Please document steps to run the application. Your submission should be a link to your Github repository which you've already forked earlier together with the source code and binaries.

Thank you!
