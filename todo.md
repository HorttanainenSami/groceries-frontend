## IN-PROGRESS

- Make E2E Tests to confirm that essential features are working properly

  -user can
  -login
  -create list
  -share a list
  -view a list
  -store items on list
  -remove items on list
  -remove relation
  - Write Readme

## TODO

- Move share list functionality to header of list view
- Show more info in main resipes menu
  ~~- last modified~~
  - show progress of list toggled/all items
  - order by last modification date
  - show if unviewed modifications in lists
- in recipe view show if other participant is viewing same recipe list

- use drizzle or other orm in database
- Make application to work in offline mode and sync changes as app is again connected to server
  - If cannot connect to server handle it correctly
    - change to offline mode
    - when connected sync to backend
- use fcm to background messaging when websocket is not initialized
  - make notification when user have shared list with you
  - if websocket not connected -> fcm
- make more alerts so user knows when something were success or error occurred
- Create CICD pipe
- possibility to store recipes and that way to bring ingredients to our task list if you are using task list as groceries list
- Make server to use https protocol
  - remove usesCleartextTraffic from app.json
- Deploy to google store

### DONE

- ~~Ability to remove relations~~
- ~~If cannot connect to db handle it correctly~~
  - ~~try to reconnect to db~~
  - ~~send error message~~
- ~~fix bug that prevents list removation because of list contains items that is not removed in progress~~
- ~~Make ability to reorder list~~
  - ~~keep order~~
- ~~Fix server and frontend to use same schemas and types~~
- ~~show with whom list is shared~~
- ~~build internal distribution~~
- ~~websocket for relations updating when relation/:id view is opened~~
- ~~Fix alert component to be rendered over the view rather in view~~
  - ~~fix alert to show only 1-2 error messsages on time and set timer only then when its viewed~~
- ~~Fix that you cannot share relations with yourself~~
- ~~Make local and server sql tables similar and to use use same field names nad types~~
  \*~~ Change interface of server and frontend so backend doesn't need to process data before pushing it to sql~~
- ~~share relations needs to be transaction so if some call fails, all will be reverted~~
- ~~Deploy to server~~
- ~~Push to docker~~
- ~~tasks are permanently stored to phone~~
- ~~make floating alert that can carry messages for user~~
- ~~tasks that are shared are pushed to server~~
- ~~tasks that are marked done, fall bottom of list, they will return to place if unmarked(?)~~
- ~~add multiple lists~~
- ~~add possibility to share with other person so both original and new user can modify list~~
  - ~~shared lists are stored to server and not shared is stored in users mobile~~
