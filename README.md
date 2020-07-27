# Fantasy Premier League Season Review
### React, Fantasy Premier League API & DB   

Review your FPL season with this website, and see stats that the officials don't show you!  

### Check it out
I've uploaded a demo video to the repository so you can check out what the app does without running it yourself (or if the FPL guys change the database format and do me dirty).  

### Setup
Install NodeJS on your machine, and then clone this repository. You can then navigate to it using the command line on your machine, and run 'npm install' to install all dependencies required. npm start should then run the app!   

If this doesn't work, try running your own CORS proxy, more information can be found here: https://github.com/Rob--W/cors-anywhere/

### Things to keep in mind:   
This will need to be adjusted for seasons past 19/20   
Also, need to adjust for the final gameweek (should just be a numerical adjustment somewhere)   
Can break sections into functions later, but for now this is good as an MVP   
Optimize this, this can be way quicker   
Some variables don't need to be stored on the client before updating state   
Make loading prioritized so the things that take less time are displayed first, keep in mind that the piechart will break if you update before the variables are ready   
Make this pretty!   
Make enter click the button   
Please check boundary conditions! We should not take into account gameweeks that did not exist, for example   
Mount CORS proxy live, now every time you use this you have to wait

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
