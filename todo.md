## IN-PROGRESS
* Make local and server sql tables similar and to use use same field names nad types
* Change interface of server and frontend so backend doesn't need to process data before pushing it to sql
* Make Tests

## TODO
* Fix that you cannot share relations with yourself
* Fix alert component to be rendered over the view rather in view
    * fix alert to show only 1-2 error messsages on time and set timer only then when its viewed
* make more alerts so user knows when something were success or error occurred
* sse for relations updating
* make notification when you user have shared list with you
* Fix server and frontend to use same schemas and types
* Create CICD pipe
* possibility to store recipes and that way to bring ingredients to our task list if you are using task list as groceries list
* ~~Ability to remove relations~~
    * if in server, popup info to collaborator and ask also from that user


### DONE
* ~~share relations needs to be transaction so if some call fails, all will be reverted~~
* ~~Deploy to server~~
* ~~Push to docker~~
* ~~tasks are permanently stored to phone~~
* ~~make floating alert that can carry messages for user~~
* ~~tasks that are shared are pushed to server~~
* ~~tasks that are marked done, fall bottom of list, they will return to place if unmarked(?)~~
* ~~add multiple lists~~
* ~~add possibility to share with other person so both original and new user can modify list~~
    * ~~shared lists are stored to server and not shared is stored in users mobile~~