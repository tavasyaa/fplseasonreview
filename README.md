# Fantasy Premier League Season Review
### React, Fantasy Premier League API & DB   
www.fplgraphs.com (if I'm still paying for server space and the domain name :) )

Review your FPL season with this website, and see stats that the officials don't show you!  

### Check it out!
I've uploaded a demo video to the repository so you can check out what the app does without running it yourself (or if the FPL guys change the database format and do me dirty).  

### Setup
Install NodeJS on your machine, and then clone this repository. You can then navigate to it using the command line on your machine, and run 'npm install' to install all dependencies required. 'npm start' should then run the app!   

If this doesn't work, try running your own CORS proxy, more information can be found here: https://github.com/Rob--W/cors-anywhere/

### Things to keep in mind:   
This will need to be adjusted for seasons past 19/20   
Can break sections into functions later, but for now this is good as an MVP   
Optimize this, this can be way quicker   
Some variables don't need to be stored on the client before updating state   
Make loading prioritized so the things that take less time are displayed first, keep in mind that the piechart will break if you update before the variables are ready   
Make enter click the button   
Please check boundary conditions! We should not take into account gameweeks that did not exist, for example   

### Things I've learned:   
Test everything first, the load time from Asia was much more than my liking   
Awesome idea, people really liked it! 92% upvotes on reddit, over 700 unique viewers in 2 days and over 4 positive comments   
Reddit is a powerful marketing tool   
Ship early! Even though I got some traffic, people beat me to the punch by two-ish days and garnered more interest   
This was awesome, I will be making more live things for sure   

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
