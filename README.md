# Stock-App

Introduction: This app is build for shop owners to update and store the details of their inventory in real time which can be used at any time.
We aimed at keeping this app user friendly and UI very simple.

Technology Stack
1. Backend: Node.js with express
2. Frontend: ejs, Bootstrap, css
3. Database: MongoDB (Mongoose)

Our web app is basicailly divided into five parts:
1. Landing Page
2. Login/Register Page
3. Stock Page
4. Graphical Analysis
5. Activity Log

We made our sign in/ register page using passport.js and also integrated it with google log in.
After authenticating, it take you to the stocks page where the user is allowed to Add a stock, Delete an existing stock and also can 
change the quantity of an existing stock.
We have a drop down menu which has two option: 
1. Activity Log: Here you can see a log of all the changes made by any user. It provides the email of user who changed it, the time and date it
was changed and all the previous and current quantity. In addition, you can also save any note in it.
2. Graphical Analysis: Here we made horizontal bar chart and a pie chart with the data stored in our database.

We have a logout button at the top-right corner of our page which redirect the user to the landing page.
